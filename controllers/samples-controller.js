const HttpError = require("../models/http-error");
const schedule = require("node-schedule");
const io = require("../util/socket");

const sendSMS = require("../util/d7network");
const mongoose = require("mongoose");

const SampleTest = require("../models/sampleTestModel");
const Kiosk = require("../models/kioskModel");

const { DUMMY_SAMPLES } = require("../models/sample-model");

exports.getSampleById = (req, res, next) => {
  const kioskId = req.params.kid;
  const sampleId = req.params.sid;
  const sample = DUMMY_SAMPLES.find((s) => s.id === sampleId); //async code

  if (!sample) {
    return next(new HttpError("Sample not found", 404));
  }
  io.getIO().in(kioskId).emit("scannedSample", sample);

  res.json(sample);
};

exports.runSampleTest = async (req, res, next) => {
  const {
    instrumentId,
    samples,
    kioskId,
    duration,
    timestamp,
    user,
  } = req.body;

  let kiosk;
  console.log(kioskId);
  try {
    kiosk = await Kiosk.findOne({ kioskId });
  } catch (err) {
    return next(new HttpError("Something went wrong!", 500));
  }

  if (!kiosk) {
    return next(new HttpError("Kiosk does not exist", 404));
  }

  const testedSample = new SampleTest({
    instrumentId,
    kiosk: kiosk._id,
    samples,
    duration,
    status: "Sample not removed",
    doneOn: new Date(timestamp),
    doneBy: user.username,
    timestamp,
  });
  // Starting a session to update kiosk and SampleTest tables
  if (samples.length === 0) {
    return next(new HttpError("Enter atleast one sample!", 500));
  }
  if (duration <= 0) {
    return next(new HttpError("Duration should be greater than zero!", 500));
  }
  try {
    let sess = await mongoose.startSession();
    sess.startTransaction();
    await testedSample.save({ session: sess });

    kiosk.samplesInTest.push(testedSample._id); // adding newly created test
    kiosk.instruments.map((instrument) => {
      //changing status of the instrument
      if (instrument.id === instrumentId) {
        instrument.filled = true;
      }
    });
    await kiosk.save({ session: sess });
    sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Could not save data", 500));
  }
  // Message for notification on start
  // const notificationMessage = `Hi ${user.username}, Test started in ${instrumentId} for ${duration} minutes. A text message will be sent on completion`;
  // sendSMS(user.contact, notificationMessage);

  const date = new Date(timestamp + duration * 60 * 1000);
  try {
    schedule.scheduleJob(date, function () {
      // Message for notification on completion
      // const notificationMessage = `Hi ${user.username}, Test completed in ${instrumentId}. Please remove sample/s from the instrument`;
      // sendSMS(user.contact, notificationMessage);
      console.log("Message sent");
    });
  } catch (error) {
    console.log(error);
  }
  res.status(201).json({ test: testedSample });
};

exports.postSampleRemovalFromInstrument = async (req, res, next) => {
  const { kioskId, instrumentId } = req.body;
  //getting the kiosk object
  let kiosk;
  try {
    kiosk = await Kiosk.findOne({ kioskId });
  } catch (err) {
    return next(new HttpError("Something went wrong!", 500));
  }

  if (!kiosk) {
    return next(new HttpError("Kiosk does not exist", 404));
  }
  //getting the sample test object
  let sampleTest;
  try {
    sampleTest = await SampleTest.findOne({
      kiosk: kiosk._id,
      instrumentId,
      status: "Sample not removed",
    });
  } catch (err) {
    return next(new HttpError("Something went wrong!", 500));
  }

  if (!sampleTest) {
    return next(new HttpError("sampleTest does not exist", 404));
  }
  // console.log(sampleTest._id, instrumentId, kioskId);
  try {
    let sess = await mongoose.startSession();
    sess.startTransaction();

    kiosk.samplesInTest.pull(sampleTest._id);

    kiosk.instruments.map((instrument) => {
      //changing status of the instrument
      if (instrument.id === instrumentId) {
        instrument.filled = false;
      }
    });

    await kiosk.save({ session: sess });

    sampleTest.status = "Sample Removed";
    await sampleTest.save({ session: sess });
    sess.commitTransaction();
  } catch (error) {
    console.log(error);
    return next(new HttpError("Could not update data", 500));
  }

  res.json({ test: sampleTest });
};
