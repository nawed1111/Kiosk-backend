const HttpError = require("../models/http-error");

const Kiosk = require("../models/kioskModel");

exports.getInstruments = async (req, res, next) => {
  const kioskId = req.params.kid;

  let kiosk;
  try {
    kiosk = await Kiosk.findOne({ kioskId }).populate("samplesInTest");
  } catch (err) {
    return next(new HttpError("Something went wrong!", 500));
  }

  if (!kiosk) {
    return next(new HttpError("Kiosk does not exist", 404));
  }
  const instruments = kiosk.instruments.filter(
    (instrument) => instrument.filled === false
  );
  res.json({
    instruments,
    testsRunning: kiosk.samplesInTest.map((test) =>
      test.toObject({ getters: true })
    ),
  });
};

exports.getInstrument = (req, res, next) => {
  const instrumentId = req.params.id;
  // const DUMMY_INSTRUMENT = DUMMY_INSTRUMENTS.find(
  //   (instrument) => instrument.id === instrumentId
  // );
  // if (!DUMMY_INSTRUMENT) {
  //   return next(new HttpError("Could not find instrument", 404));
  // }
  // res.json({ DUMMY_INSTRUMENT });
};
