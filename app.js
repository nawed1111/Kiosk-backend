require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const HttpError = require("./models/http-error");
const samplesRoutes = require("./routes/samples-routes");
const authRoutes = require("./routes/auth-routes");
const instrumentRoutes = require("./routes/instrument-routes");
const kioskRoutes = require("./routes/kiosk-routes");

const mongodbURI = process.env.MONGODB_URI;

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); //http://localhost:3000
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use("/api/kiosks", kioskRoutes);
app.use("/api/instruments", instrumentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/samples", samplesRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not found this  route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

mongoose
  .connect(mongodbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("DB Connected!");
    const server = app.listen(5000);

    const io = require("./socket").init(server);

    io.on("connect", (socket) => {
      // const clientIp = socket.request.connection.remoteAddress.split(":")[2];
      console.log("Client Connected=> ip: ", socket.id);

      socket.on("joinAuthRoom", (room) => {
        socket.join(room);
        console.log("Joined room: ", room);
      });
      socket.on("joinSampleRoom", (room) => {
        socket.join(room);
        console.log("Joined room: ", room);
      });
      socket.on("disconnect", () => {
        console.log("Client Disconnected ", socket.id);
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
