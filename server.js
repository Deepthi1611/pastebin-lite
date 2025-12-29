const express = require("express");
const { connectRedis } = require("./redisClient");
const index = require("./routes/index");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

connectRedis()
  .then(() => console.log("Redis connected"))
  .catch((err) => {
    console.error("Failed to connect Redis", err);
    process.exit(1);
  });

app.use("/api", index);

app.get("/", (req, res) => {
  res.json({ message: "Pastebin-Lite server running" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});