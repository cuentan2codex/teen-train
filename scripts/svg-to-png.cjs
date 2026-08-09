// Convierte los SVG a PNG usando sharp.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'icons');

async function run() {
  for (const size of [192, 512]) {
    const svgPath = path.join(dir, `icon-${size}.svg`);
    const pngPath = path.join(dir, `icon-${size}.png`);
    const svg = fs.readFileSync(svgPath);
    await sharp(svg).resize(size, size).png().toFile(pngPath);
    console.log('PNG creado:', pngPath);
  }
  // apple-touch-icon
  const appleSvg = path.join(dir, 'apple-touch-icon.svg');
  const applePng = path.join(dir, 'apple-touch-icon.png');
  await sharp(fs.readFileSync(appleSvg)).resize(180, 180).png().toFile(applePng);
  console.log('PNG creado:', applePng);

  // favicon
  const faviconPath = path.join(__dirname, '..', 'public', 'favicon.png');
  await sharp(fs.readFileSync(path.join(dir, 'icon-512.svg'))).resize(32, 32).png().toFile(faviconPath);
  console.log('Favicon creado:', faviconPath);
}

run().catch((e) => { console.error(e); process.exit(1); });
