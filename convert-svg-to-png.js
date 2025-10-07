const sharp = require('sharp');

const INPUT_SVG_PATH = 'public/DigitalBR.svg';

function convertSvgToPng(inputPath, outputPath, width, height) {
  sharp(inputPath)
    .resize(width, height)
    .png()
    .toFile(outputPath)
    .catch(err => {
      console.error(`Error converting SVG to ${width}x${height} PNG:`, err);
    });
}

convertSvgToPng(INPUT_SVG_PATH, 'public/DigitalBR-192.png', 192, 192);
convertSvgToPng(INPUT_SVG_PATH, 'public/DigitalBR-512.png', 512, 512);
