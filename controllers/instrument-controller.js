const HttpError = require("../models/http-error");
const axios = require("axios");

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

exports.getInstrumentFromLIMS = async (req, res, next) => {
  const instrumentId = req.params.iid;

  console.log("Token: ", process.env.LIMS_ACCESS_TOKEN);
  if (!process.env.LIMS_ACCESS_TOKEN) return next(HttpError("No token", 500));
  try {
    const response = await axios.get(
      `http://localhost:3030/lims/api/instruments/${instrumentId}`,
      {
        headers: {
          Authorization: "Bearer " + process.env.LIMS_ACCESS_TOKEN,
        },
      }
    );
    res.json({
      message: "Instrument detail fetched Successfully",
      instrument: response.data,
    });
  } catch (error) {
    next(error);
  }
};
/*
exports.getSelectedPropertiesOfInstrumentFromLIMS = async (req, res, next) => {
  const instrumentId = req.params.iid;
  const { properties } = req.body;
  // console.log("Properties: ", properties);
  console.log("Token: ", process.env.LIMS_ACCESS_TOKEN);
  if (!process.env.LIMS_ACCESS_TOKEN) return next(HttpError("No token", 500));
  try {
    const response = await axios.get(
      `http://localhost:3030/lims/api/instruments/${instrumentId}`,
      {
        headers: {
          Authorization: "Bearer " + process.env.LIMS_ACCESS_TOKEN,
        },
      }
    );
    // console.log("Instrrument ", response.data);

    const checkedProperties = response.data.properties.filter((prop) =>
      properties.includes(prop.property)
    );
    // console.log("checkedProperties ", checkedProperties);
    res.json({
      message: "Instrument detail fetched Successfully",
      instrument: {
        id: response.data.instrumentid,
        name: response.data.name,
        properties: checkedProperties,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }

  /*
  let checkedProperties = {};
  properties.forEach((element) => {
    if (element.name in instrument.properties)
      checkedProperties[element.name] = instrument.properties[element.name];
  });
  */
// console.log(checkedProperties);
// };
