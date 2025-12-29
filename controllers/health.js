const { client } = require("../redisClient");

async function healthCheck(req, res) {
  try {
    await client.ping();
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
}

module.exports = {
  healthCheck,
};