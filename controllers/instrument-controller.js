const HttpError = require("../models/http-error");
const { DUMMY_KIOK_INSTRUMENTS } = require("../models/kiosk-model");

const io = require("../socket");

exports.getInstruments = (req, res, next) => {
  const kioskId = req.params.kid;
  console.log(kioskId);
  const kiosk = DUMMY_KIOK_INSTRUMENTS.find((data) => data.id === kioskId);
  if (!kiosk) {
    return next(new HttpError("Could not find kiosk", 404));
  }
  res.json({ instruments: kiosk.instruments });
};

exports.getInstrument = (req, res, next) => {
  const instrumentId = req.params.id;
  const DUMMY_INSTRUMENT = DUMMY_INSTRUMENTS.find(
    (instrument) => instrument.id === instrumentId
  );
  if (!DUMMY_INSTRUMENT) {
    return next(new HttpError("Could not find instrument", 404));
  }
  res.json({ DUMMY_INSTRUMENT });
};
