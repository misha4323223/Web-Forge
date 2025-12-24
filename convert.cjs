const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dirs = [
  'client/src/assets/generated_images',
  'client/src/assets/stock_images'
];

async function convert() {
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.match(/\.(png|jpg|jpeg)$/i)) {
        const inputPath = path.join(dir, file);
        const outputPath = path.join(dir, file.replace(/\.(png|jpg|jpeg)$/i, '.webp'));
        try {
          await sharp(inputPath).webp({ quality: 85 }).toFile(outputPath);
          console.log(`Converted: ${file} -> ${path.basename(outputPath)}`);
        } catch (err) {
          console.error(`Error converting ${file}:`, err.message);
        }
      }
    }
  }
}

convert();
