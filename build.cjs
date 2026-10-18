const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'media-manifest.json'), 'utf8'));
const output = path.join(__dirname, 'dist');
fs.mkdirSync(output, { recursive: true });
for (const name of ['index.html', 'style.css', 'app.js', 'works.js', 'bilibili-test.html']) {
  fs.copyFileSync(path.join(__dirname, name), path.join(output, name));
}
for (const cover of manifest.covers) {
  const destination = path.join(output, cover.output);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(__dirname, cover.input), destination);
}
for (const video of manifest.videos) {
  const destination = path.join(output, video.output);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const hash = crypto.createHash('sha256');
  let total = 0;
  const fd = fs.openSync(destination, 'w');
  try {
    for (const part of video.parts) {
      const bytes = fs.readFileSync(path.join(__dirname, part));
      fs.writeFileSync(fd, bytes);
      hash.update(bytes);
      total += bytes.length;
    }
  } finally {
    fs.closeSync(fd);
  }
  if (total !== video.bytes || hash.digest('hex') !== video.sha256) {
    throw new Error(`Media integrity check failed: ${video.output}`);
  }
  console.log(`Verified ${video.output}: ${total} bytes`);
}
console.log(`Built complete portfolio: ${manifest.videos.length} videos, ${manifest.covers.length} covers.`);
