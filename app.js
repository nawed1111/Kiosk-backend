require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const HttpError = require("./models/http-error");
const testRoutes = require("./routes/test-routes");
const authRoutes = require("./routes/auth-routes");
const instrumentRoutes = require("./routes/instrument-routes");
const kioskRoutes = require("./routes/kiosk-routes");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
app.use("/api/test", testRoutes);

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

// Connect to the database
require("./helpers/init_mongodb");

// Connect to the redis server
require("./helpers/init_redis");

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log("====================================");
  console.log("Kiosk Server started on port 5000..");
  console.log("====================================");
});

const io = require("./util/socket").init(server);

io.on("connect", (socket) => {
  // const clientIp = socket.request.connection.remoteAddress.split(":")[2];
  console.log("Client Connected=> ", socket.id);

  socket.on("joinAuthRoom", (room) => {
    socket.join(room);
    console.log("Joined room: ", room);
    console.log("Rooms: ", socket.adapter.rooms);
  });

  socket.on("disconnect", () => {
    console.log("Client Disconnected ", socket.id);
  });
});
