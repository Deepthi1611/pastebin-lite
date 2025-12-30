const { nanoid } = require("nanoid");
const { client } = require("../redisClient");

function getCurrentTime(req) {
  if (
    process.env.TEST_MODE === "1" &&
    req.headers["x-test-now-ms"]
  ) {
    return Number(req.headers["x-test-now-ms"]);
  }

  return Date.now();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function viewPasteHtml(req, res) {
  const { id } = req.params;

  console.log('View paste HTML called with id:', id);

  const raw = await client.get(`paste:${id}`);
  if (!raw) {
    return res.status(404).send("Not Found");
  }

  const paste = JSON.parse(raw);
  const now =
    process.env.TEST_MODE === "1" && req.headers["x-test-now-ms"]
      ? Number(req.headers["x-test-now-ms"])
      : Date.now();

  // TTL check
  if (
    paste.ttl_seconds !== null &&
    paste.created_at + paste.ttl_seconds * 1000 <= now
  ) {
    return res.status(404).send("Paste expired");
  }

  // View limit check
  if (
    paste.max_views !== null &&
    paste.views >= paste.max_views
  ) {
    return res.status(404).send("Paste unavailable, max views exceeded");
  }

  // Increment views
  paste.views += 1;
  await client.set(`paste:${id}`, JSON.stringify(paste));

  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Paste</title>
      </head>
      <body>
        <pre>${escapeHtml(paste.content)}</pre>
      </body>
    </html>
  `);
}

async function createPaste(req, res) {
  let { content, ttl_seconds, max_views } = req.body;

  console.log(req.body, 'req body');

  if (ttl_seconds !== undefined && ttl_seconds !== '') {
    ttl_seconds = Number(ttl_seconds);
    } else ttl_seconds = undefined;
  if (max_views !== undefined && max_views !== '') {
    max_views = Number(max_views);
    } else max_views = undefined;

  // Validate content
  if (!content || typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({ error: "Invalid content, content is required" });
  }

  console.log(ttl_seconds, 'ttl seconds', typeof(ttl_seconds))
  // Validate ttl_seconds
  if (
    ttl_seconds !== undefined &&
    (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
  ) {
    return res.status(400).json({ error: "Invalid ttl_seconds, ttl_seconds must be a positive integer" });
  }

  // Validate max_views
  if (
    max_views !== undefined &&
    (!Number.isInteger(max_views) || max_views < 1)
  ) {
    return res.status(400).json({ error: "Invalid max_views, max_views must be a positive integer" });
  }

  const id = nanoid();

  const pasteData = {
    content,
    created_at: Date.now(),
    ttl_seconds: ttl_seconds ?? null,
    max_views: max_views ?? null,
    views: 0,
  };

  await client.set(`paste:${id}`, JSON.stringify(pasteData));

  const pasteUrl = `/p/${id}`;

  if (req.headers.accept && req.headers.accept.includes("text/html")) {
    return res.redirect(pasteUrl);
    }

   res.status(201).json({
    id,
    url: `${req.protocol}://${req.get("host")}${pasteUrl}`,
    });
}

async function getPaste(req, res) {
  const { id } = req.params;

  console.log('Get paste called with id:', id);

  const raw = await client.get(`paste:${id}`);

  if (!raw) {
    return res.status(404).json({ error: "Paste not found" });
  }

  const paste = JSON.parse(raw);
  const now = getCurrentTime(req);

  // TTL expired
  if (
    paste.ttl_seconds !== null &&
    paste.created_at + paste.ttl_seconds * 1000 <= now
  ) {
    return res.status(404).json({ error: "Paste expired" });
  }

  // View limit exceeded
  if (
    paste.max_views !== null &&
    paste.views >= paste.max_views
  ) {
    return res.status(404).json({ error: "Paste unavailable, max views exceeded" });
  }

  paste.views += 1;
  await client.set(`paste:${id}`, JSON.stringify(paste));

  const remainingViews =
    paste.max_views === null
      ? null
      : Math.max(paste.max_views - paste.views, 0);

  res.status(200).json({
    content: paste.content,
    remaining_views: remainingViews,
    expires_at:
      paste.ttl_seconds === null
        ? null
        : new Date(
            paste.created_at + paste.ttl_seconds * 1000
          ).toISOString(),
  });
}

module.exports = {
  createPaste,
  getPaste,
  viewPasteHtml
};