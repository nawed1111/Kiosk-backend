const HttpError = require("../models/http-error");

const io = require("../socket.js");
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

  io.getIO().in(`${kioskId}-samples`).emit("scannedSample", sample);

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
    doneOn: new Date(timestamp),
    doneBy: user,
    timestamp,
  });
  // Starting a session to update kiosk and SampleTest tables
  try {
    let sess = await mongoose.startSession();
    sess.startTransaction();
    await testedSample.save({ session: sess });

    kiosk.samplesInTest.push(testedSample); // adding newly created test
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
    sampleTest = await SampleTest.findOne({ kiosk: kiosk._id, instrumentId });
  } catch (err) {
    return next(new HttpError("Something went wrong!", 500));
  }

  if (!sampleTest) {
    return next(new HttpError("sampleTest does not exist", 404));
  }

  try {
    kiosk.samplesInTest.pull(sampleTest._id);
    kiosk.instruments.map((instrument) => {
      //changing status of the instrument
      if (instrument.id === instrumentId) {
        instrument.filled = false;
      }
    });

    await kiosk.save();
  } catch (error) {
    return next(new HttpError("Could not update data", 500));
  }

  res.json({ message: "Successfully updated!" });
};
