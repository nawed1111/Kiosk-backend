const redis = require("redis");

const redis_url = `//${process.env.REDIS_SERVER}:${process.env.REDIS_PORT}/${process.env.REDIS_DB_NUMBER}`;
const redisClient = redis.createClient(redis_url);

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
