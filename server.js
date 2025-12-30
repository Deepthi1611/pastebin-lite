const express = require("express");
const path = require("path");
const { connectRedis } = require("./redisClient");
const index = require("./routes/index");
const htmlRoutes = require("./routes/html");

const app = express();
const PORT = process.env.PORT || 3000;

// body parser middleware
app.use(express.json());
// to support URL-encoded bodies
app.use(express.urlencoded({ extended: false }));

connectRedis()
  .then(() => console.log("Redis connected"))
  .catch((err) => {
    console.error("Failed to connect Redis", err);
    process.exit(1);
  });

app.use("/api", index);
app.use(htmlRoutes);

// app.get("/", (req, res) => {
//   res.json({ message: "Pastebin-Lite server running" });
// });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// app.get("/", (req, res) => {
//   res.send("<h1>HTML WORKS</h1>");
// });

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});