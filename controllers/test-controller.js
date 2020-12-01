const HttpError = require("../models/http-error");
const schedule = require("node-schedule");
const io = require("../util/socket");

const sendSMS = require("../util/d7network");
const mongoose = require("mongoose");

const SampleTest = require("../models/sampleTestModel");
const Kiosk = require("../models/kioskModel");
const { DUMMY_INSTRUMENTS } = require("../models/instrument-model-LIMS");

const { DUMMY_SAMPLES } = require("../models/sample-model");

exports.getSampleById = (req, res, next) => {
  const kioskId = req.params.kid;
  const sampleId = req.params.sid;
  const sample = DUMMY_SAMPLES.find((s) => s.id === sampleId); //async code

  if (!sample) {
    return next(new HttpError("Sample not found", 404));
  }
  io.getIO().in(kioskId).emit("scannedSample", sample);

  res.json({ message: "Sample fetched successfully", sample });
};

/*
exports.getRunningTestById = async (req, res, next) => {
  const testId = req.params.tid;
  let test;
  try {
    test = await SampleTest.findById(testId);
  } catch (err) {
    return next(new HttpError("Something went wrong!", 500));
  }

  if (!test) {
    return next(new HttpError("Test does not exist", 404));
  }

  res.json({ message: "Test fetched", test });
};

*/

exports.runSampleTest = async (req, res, next) => {
  const { instrumentId, samples, kioskId, duration, timestamp } = req.body;

  let kiosk;

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
    doneOn: new Date(+timestamp),
    doneBy: req.user.username,
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

    kiosk.samplesInTest.push(testedSample._id);

    /**************API call to LIMS****************/

    const instrument = DUMMY_INSTRUMENTS.find(
      (instrument) => instrument.id === instrumentId
    );
    if (!instrument) {
      return next(new HttpError("Could not find instrument", 404));
    }

    instrument.properties["isFilled"] = true;

    /**************API call to LIMS*****************/

    await kiosk.save({ session: sess });
    sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Could not save data", 500));
  }

  const date = new Date(+timestamp + duration * 60 * 1000);
  try {
    schedule.scheduleJob(date, function () {
      // Message for notification on completion
      // const notificationMessage = `Hi ${req.user.username}, Test completed in ${instrumentId}. Please remove sample/s from the instrument`;
      // sendSMS(req.user.contact, notificationMessage);
      console.log("Message sent");
    });
  } catch (error) {
    console.log(error);
  }
  res.status(201).json({ test: testedSample });
};

exports.postSampleRemovalFromInstrument = async (req, res, next) => {
  const { testId } = req.body;

  let sampleTest;
  try {
    sampleTest = await SampleTest.findById(testId).populate("kiosk");
  } catch (err) {
    return next(new HttpError("Something went wrong!", 500));
  }

  if (!sampleTest) {
    return next(new HttpError("sampleTest does not exist", 404));
  }

  const kiosk = sampleTest.kiosk;

  const timeLeft =
    +sampleTest.timestamp +
    sampleTest.duration * 60 * 1000 -
    new Date().getTime();
  if (timeLeft <= 0) {
    try {
      let sess = await mongoose.startSession();
      sess.startTransaction();

      kiosk.samplesInTest.pull(sampleTest._id);

      await kiosk.save({ session: sess });

      /**************API call to LIMS****************/

      const instrument = DUMMY_INSTRUMENTS.find(
        (instrument) => instrument.id === sampleTest.instrumentId
      );
      if (!instrument) {
        return next(new HttpError("Could not find instrument", 404));
      }

      instrument.properties["isFilled"] = false;

      /**************API call to LIMS*****************/

      sess.commitTransaction();
    } catch (error) {
      return next(new HttpError("Could not update data", 500));
    }

    res.json({ message: "Updated successfully", test: sampleTest });
  } else {
    res.status(500).json({
      message: "Test still running! Cannot update",
      timeRemaining: `${timeLeft / 1000} seconds`,
    });
  }
};
