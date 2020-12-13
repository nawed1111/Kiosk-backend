const createError = require("http-errors");
const axios = require("axios");

const Kiosk = require("../models/kioskModel");

exports.getInstruments = async (req, res, next) => {
  const kioskId = req.params.kid;

  let kiosk;
  try {
    kiosk = await Kiosk.findOne({ kioskId }).populate("samplesInTest");
  } catch (err) {
    return next(createError.NotImplemented());
  }

  if (!kiosk) {
    return next(createError.NotFound());
  }
  /**************API call to LIMS****************/
  let instrumentsWithStatus = [];
  try {
    await Promise.all(
      kiosk.instruments.map(async (ins) => {
        const response = await axios.get(
          `${process.env.LIMS_API_BASEURL}/lims/api/instruments/${ins.instrumentid}`,
          {
            headers: {
              Authorization: "Bearer " + req.token,
            },
          }
        );

        instrumentsWithStatus.push({
          instrumentid: ins.instrumentid,
          name: ins.name,
          status: response.data.status,
        });
      })
    );

    res.json({
      message: "Fetched Instruments Successfully",
      instruments: instrumentsWithStatus,
      testsRunning: kiosk.samplesInTest.map((test) =>
        test.toObject({ getters: true })
      ),
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
  /**************API call to LIMS****************/
};

exports.getInstrumentFromLIMS = async (req, res, next) => {
  const instrumentId = req.params.iid;

  try {
    const response = await axios.get(
      `${process.env.LIMS_API_BASEURL}/lims/api/instruments/${instrumentId}`,
      {
        headers: {
          Authorization: "Bearer " + req.token,
        },
      }
    );

    res.json({
      message: "Instrument detail fetched Successfully",
      instrument: response.data,
    });
  } catch (error) {
    console.log(error);
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
      `${process.env.LIMS_API_BASEURL}/lims/api/instruments/${instrumentId}`,
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
