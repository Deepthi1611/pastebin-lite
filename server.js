const express = require("express");
const path = require("path");
const { connectRedis } = require("./redisClient");
const index = require("./routes/index");
const htmlRoutes = require("./routes/html");

const app = express();
const PORT = process.env.PORT || 3000;

// body middleware

// body parser middleware
app.use(express.json());
// to support URL-encoded bodies
app.use(express.urlencoded({ extended: false }));

// static files middleware

// to serve static files like CSS, JS, images from 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// routes middleware
app.use("/api", index);
app.use(htmlRoutes);


connectRedis()
  .then(() => console.log("Redis connected"))
  .catch((err) => {
    console.error("Failed to connect Redis", err);
    process.exit(1);
  });


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});