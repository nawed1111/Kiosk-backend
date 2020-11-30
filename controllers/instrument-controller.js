const HttpError = require("../models/http-error");

const { DUMMY_INSTRUMENTS } = require("../models/instrument-model-LIMS");
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

  res.json({
    message: "Fetched Instruments Successfully",
    instruments: kiosk.instruments,
    testsRunning: kiosk.samplesInTest.map((test) =>
      test.toObject({ getters: true })
    ),
  });
};

exports.getInstrumentFromLIMS = (req, res, next) => {
  const instrumentId = req.params.iid;

  const instrument = DUMMY_INSTRUMENTS.find(
    (instrument) => instrument.id === instrumentId
  );
  if (!instrument) {
    return next(new HttpError("Could not find instrument", 404));
  }
  res.json({ message: "Fetched Successfully", instrument });
};

exports.getSelectedPropertiesOfInstrumentFromLIMS = (req, res, next) => {
  const instrumentId = req.params.iid;
  const { properties } = req.body;
  // console.log("Properties: ", properties);
  const instrument = DUMMY_INSTRUMENTS.find(
    (instrument) => instrument.id === instrumentId
  );
  if (!instrument) {
    return next(new HttpError("Could not find instrument", 404));
  }

  let checkedProperties = {};
  properties.forEach((element) => {
    if (element.name in instrument.properties)
      checkedProperties[element.name] = instrument.properties[element.name];
  });
  // console.log(checkedProperties);
  res.json({
    message: "Fetched Successfully",
    instrument: {
      id: instrument.id,
      name: instrument.name,
      properties: checkedProperties,
    },
  });
};
