const sharp = require('sharp');

sharp('public/DigitalBR.svg')
  .resize(192, 192)
  .png()
  .toFile('public/DigitalBR-192.png')
  .catch(err => {
    console.error('Error converting SVG to 192x192 PNG:', err);
  });

sharp('public/DigitalBR.svg')
  .resize(512, 512)
  .png()
  .toFile('public/DigitalBR-512.png')
  .catch(err => {
    console.error('Error converting SVG to 512x512 PNG:', err);
  });
