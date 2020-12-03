const redis = require("redis");

const redisClient = redis.createClient({
  host: process.env.REDIS_SERVER,
  port: process.env.REDIS_PORT,
});

redisClient.on("connect", () => {
  console.log("Client connected to redis...");
});

redisClient.on("error", (err) => {
  console.log(`Error from redis - ${err.message}`);
});

redisClient.on("ready", () => {
  console.log("ReadClient connected to redis and ready to use...");
});

redisClient.on("end", () => {
  console.log("Client disconnected from redis...");
});

process.on("SIGINT", () => {
  redisClient.quit();
});

module.exports = redisClient;
