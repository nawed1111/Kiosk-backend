const createError = require("http-errors");

const Kiosk = require("../models/kioskModel");

exports.getKioskById = async (req, res, next) => {
  const kioskId = req.params.kid;
  let kiosk;
  try {
    kiosk = await Kiosk.findOne({ kioskId });

    if (!kiosk) {
      throw createError.NotFound("Kiosk not found!");
    }

    res.json({ message: "Fetched kiosk successfully" });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

exports.getKiosks = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 5;
  try {
    const totalKiosks = await Kiosk.find().countDocuments();
    const kiosks = await Kiosk.find()
      .populate("samplesInTest")
      .select("kioskId rfreader instruments created updated samplesInTest")
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
    console.log(err.message);
    next(err);
  }
};

exports.createKiosk = async (req, res, next) => {
  const { kioskId, instruments, rfreader } = req.body;
  let existingKiosk;
  try {
    existingKiosk = await Kiosk.findOne({ kioskId });

    if (existingKiosk) {
      throw createError.Conflict(`A kiosk with same id ${kioskId} exists`);
    }

    const createdKiosk = new Kiosk({
      kioskId,
      rfreader,
      instruments,
      updated: Date.now(),
    });
    await createdKiosk.save();

    res.json({ message: "Kiosk created successfully", kiosk: createdKiosk });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

exports.updateKiosk = async (req, res, next) => {
  const kioskId = req.params.kid;
  const { instruments } = req.body;
  let kiosk;
  try {
    kiosk = await Kiosk.findOne({ kioskId });

    if (!kiosk) {
      throw createError.NotFound(`A kiosk with id ${kioskId} does not exist`);
    }
    instruments.forEach((element) => {
      kiosk.instruments.push(element);
    });

    kiosk.updated = Date.now();

    await kiosk.save();

    res.json({ message: "Kiosk updated successfully!", kiosk });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

exports.deleteKiosk = async (req, res, next) => {
  const kioskId = req.params.kid;

  try {
    await Kiosk.deleteOne({ kioskId });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};
