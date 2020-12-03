const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("MongoDB connected..");
  })
  .catch((err) => {
    console.log("Error connecting to the database..", err.message);
  });

mongoose.connection.on("connected", () => {
  console.log("mongoose connected to the database..");
});

mongoose.connection.on("error", (err) => {
  console.log("Error in database..", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("mongoose connection is disconnected..");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
