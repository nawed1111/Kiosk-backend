const HttpError = require("../models/http-error");

const Kiosk = require("../models/kioskModel");

exports.getKiosk = async (req, res, next) => {
  const kioskId = req.params.kid;
  let kiosk;
  try {
    kiosk = await Kiosk.findOne({ kioskId });
  } catch (err) {
    return next(new HttpError("Something went wrong", 501));
  }

  if (!kiosk) {
    return next(new HttpError("Kiosk not found!", 500));
  }

  res.json({ kioskId: kiosk.kioskId });
};

exports.createKiosk = async (req, res, next) => {
  const kioskId = req.params.kid;
  const { instruments } = req.body;
  let existingKiosk;
  try {
    existingKiosk = await Kiosk.findOne({ kioskId });
  } catch (err) {
    return next(new HttpError("Creating kiosk failed!", 500));
  }
  if (existingKiosk) {
    return next(new HttpError("A kiosk with same id exists alreday"));
  }

  const createdKiosk = new Kiosk({
    kioskId,
    instruments,
    updated: Date.now(),
  });

  try {
    await createdKiosk.save();
  } catch (err) {
    return next(new HttpError("Something went wrong!", 500));
  }

  res.json({ kiosk: createdKiosk });
};

exports.updateKiosk = async (req, res, next) => {
  const kioskId = req.params.kid;
  const { instruments } = req.body;
  let kiosk;
  try {
    kiosk = await Kiosk.findOne({ kioskId });
  } catch (err) {
    return next(new HttpError("updating kiosk failed!", 500));
  }
  if (!kiosk) {
    return next(
      new HttpError(`A kiosk with same id ${kioskId} does not exist`, 422) //update status code later
    );
  }

  kiosk.instruments = instruments;
  kiosk.updated = Date.now();

  try {
    await kiosk.save();
  } catch (err) {
    return next(new HttpError("Something went wrong!", 500));
  }

  res.json(kiosk);
};
