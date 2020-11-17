const uuid = require("uuid").v4;
const HttpError = require("../models/http-error");

const io = require("../socket.js");

const { DUMMY_SAMPLES } = require("../models/sample-model");
const { DUMMY_TESTS } = require("../models/tests-model");

function getTimestamp() {
  var date = new Date();
  var str =
    date.getFullYear() +
    "-" +
    (date.getMonth() + 1) +
    "-" +
    date.getDate() +
    " " +
    date.getHours() +
    ":" +
    date.getMinutes() +
    ":" +
    date.getSeconds();

  return str;
}

exports.getSampleById = (req, res, next) => {
  const kioskId = req.params.kid;
  const sampleId = req.params.sid;
  const sample = DUMMY_SAMPLES.find((s) => s.id === sampleId); //async code

  if (!sample) {
    return next(new HttpError("Sample not found", 404)); // next insted of throw incase of asynchronous operation
  }

  // console.log(sample);

  io.getIO().in(`${kioskId}-samples`).emit("scannedSample", sample);

  res.json(sample);
};

exports.runSampleTest = (req, res, next) => {
  const { sid, temparature, testRunTime } = req.body;
  const DUMMY_SAMPLE_TEST = {
    id: uuid(),
    sid,
    temparature,
    testRunTime,
    testDoneOn: getTimestamp(),
  };

  DUMMY_TESTS.push(DUMMY_SAMPLE_TEST); //async code

  res.status(201).json({ test: DUMMY_SAMPLE_TEST });
};

exports.postTestRunCompletion = (req, res, next) => {};
