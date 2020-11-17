const { DUMMY_KIOK_INSTRUMENTS } = require("../models/kiosk-model");
const HttpError = require("../models/http-error");

exports.getKiosk = (req, res, next) => {
  const kioskId = req.params.kid;
  const kiosk = DUMMY_KIOK_INSTRUMENTS.find((k) => k.id === kioskId);

  if (!kiosk) {
    return next(new HttpError("Kiosk not found!", 404));
  }

  res.json(kiosk);
};
