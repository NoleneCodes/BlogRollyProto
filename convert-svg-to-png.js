const sharp = require('sharp');

sharp('public/DigitalBR.svg')
  .resize(192, 192)
  .png()
  .toFile('public/DigitalBR-192.png');

sharp('public/DigitalBR.svg')
  .resize(512, 512)
  .png()
  .toFile('public/DigitalBR-512.png');
