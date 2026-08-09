// Genera iconos SVG simples para PWA.
const fs = require('fs');
const path = require('path');

function makeIcon(size, name) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a78f5"/>
      <stop offset="100%" stop-color="#1661e0"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="url(#g)"/>
  <g fill="#fff">
    <rect x="${size * 0.30}" y="${size * 0.34}" width="${size * 0.06}" height="${size * 0.32}" rx="${size * 0.02}"/>
    <rect x="${size * 0.64}" y="${size * 0.34}" width="${size * 0.06}" height="${size * 0.32}" rx="${size * 0.02}"/>
    <rect x="${size * 0.25}" y="${size * 0.40}" width="${size * 0.05}" height="${size * 0.20}" rx="${size * 0.015}"/>
    <rect x="${size * 0.70}" y="${size * 0.40}" width="${size * 0.05}" height="${size * 0.20}" rx="${size * 0.015}"/>
    <rect x="${size * 0.36}" y="${size * 0.47}" width="${size * 0.28}" height="${size * 0.06}" rx="${size * 0.03}"/>
  </g>
</svg>`;
  const outPath = path.join(__dirname, '..', 'public', 'icons', name + '.svg');
  fs.writeFileSync(outPath, svg);
  console.log('Creado', outPath);
}

makeIcon(192, 'icon-192');
makeIcon(512, 'icon-512');
makeIcon(180, 'apple-touch-icon');
