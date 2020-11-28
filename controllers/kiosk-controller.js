const HttpError = require("../models/http-error");

const Kiosk = require("../models/kioskModel");

exports.getKioskById = async (req, res, next) => {
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

  res.json({ kiosk: kiosk, message: "Fetched kiosk successfully" });
};

exports.getKiosks = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 5;
  try {
    const totalKiosks = await Kiosk.find().countDocuments();
    const kiosks = await Kiosk.find()
      .select("kioskId instruments._id created updated samplesInTest")
      .lean()
      .sort({ created: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: "Fetched kiosks successfully.",
      kiosks,
      totalKiosks,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
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
    return next(new HttpError("A kiosk with same id alreday exists "), 500);
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
      new HttpError(`A kiosk with id ${kioskId} does not exist`, 422) //update status code later
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

exports.deleteKiosk = async (req, res, next) => {
  const kioskId = req.params.kid;
  let kiosk;
  try {
    kiosk = await Kiosk.deleteOne({ kioskId });
  } catch (err) {
    return next(new HttpError("Deleting kiosk failed!", 500));
  }

  res.json({ message: "Deleted successfully" });
};
