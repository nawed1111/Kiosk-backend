const schedule = require("node-schedule");
const io = require("../util/socket");
const axios = require("axios");
const createError = require("http-errors");

const sendSMS = require("../util/d7network");
const mongoose = require("mongoose");

const SampleTest = require("../models/sampleTestModel");
const Kiosk = require("../models/kioskModel");

exports.getSampleByIdFromLims = async (req, res, next) => {
  const kioskId = req.params.kid;
  const sampleId = req.params.sid;

  /**************API call to LIMS****************/
  try {
    const response = await axios.get(
      `${process.env.LIMS_API_BASEURL}/lims/api/samples/${sampleId}`,
      {
        headers: {
          Authorization: "Bearer " + req.token,
        },
      }
    );

    const sample = response.data;
    /**************API call to LIMS****************/

    io.getIO().in(kioskId).emit("scannedSample", sample);

    res.json({ message: "Sample fetched successfully" });
  } catch (error) {
    next(error);
  }
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
  console.log(kioskId);
  let kiosk;

  try {
    if (samples.length === 0) {
      throw createError.BadRequest("No Sample to test");
    }
    if (duration <= 0) {
      throw createError.BadRequest("Duration should be greater than zero!");
    }

    kiosk = await Kiosk.findOne({ kioskId });

    if (!kiosk) throw createError.NotFound("Kiosk does not exist");
  } catch (err) {
    return next(err);
  }

  const filterSamples = samples.map((sample) => ({
    sampleid: sample.sampleid,
  }));

  const testedSample = new SampleTest({
    instrumentId,
    kiosk: kiosk._id,
    samples: filterSamples,
    duration,
    doneOn: new Date(+timestamp),
    doneBy: req.user.name,
    timestamp,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    kiosk.samplesInTest.push(testedSample._id);

    /**************API call to LIMS****************/

    await axios.patch(
      `${process.env.LIMS_API_BASEURL}/lims/api/instruments/${instrumentId}`,
      {
        status: "inuse",
      },
      {
        headers: {
          Authorization: "Bearer " + req.token,
          "Content-Type": "application/json",
        },
      }
    );

    /**************API call to LIMS*****************/
    await testedSample.save({ session: sess });
    await kiosk.save({ session: sess });
    sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(err);
  }

  const date = new Date(+timestamp + duration * 60 * 1000);

  try {
    schedule.scheduleJob(date, function () {
      // Message for notification on completion
      // const notificationMessage = `Hi ${req.user.fname}, Test completed in ${instrumentId}.
      // Please remove sample/s from the instrument`;
      // sendSMS(`${req.user.countrycode}${req.user.mobno}`, notificationMessage);
    });
  } catch (error) {
    next(error);
  }
  res.json({ test: testedSample });
};

exports.postSampleRemovalFromInstrument = async (req, res, next) => {
  const { testId } = req.body;

  let sampleTest;
  try {
    sampleTest = await SampleTest.findById(testId).populate("kiosk");

    if (!sampleTest) throw createError.NotFound("sampleTest does not exist");
  } catch (err) {
    return next(err);
  }

  const kiosk = sampleTest.kiosk;

  const date = new Date(sampleTest.timestamp + sampleTest.duration * 60 * 1000);

  const difference = +date - +new Date();

  if (difference > 0)
    return next(createError.Forbidden("Forbidden. Test running!"));

  try {
    kiosk.samplesInTest.pull(sampleTest._id);
    await kiosk.save();

    /**************API call to LIMS****************/
    await axios.patch(
      `${process.env.LIMS_API_BASEURL}/lims/api/instruments/${sampleTest.instrumentId}`,
      {
        status: "available",
      },
      {
        headers: {
          Authorization: "Bearer " + req.token,
          "Content-Type": "application/json",
        },
      }
    );
    /**************API call to LIMS*****************/

    res.json({ message: "Updated successfully", test: sampleTest });
  } catch (error) {
    next(error);
  }
};
