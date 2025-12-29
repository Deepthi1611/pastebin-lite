const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Temporary root route (sanity check)
app.get("/", (req, res) => {
  res.json({ message: "Pastebin-Lite server running" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});