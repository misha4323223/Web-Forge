import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inputPath = path.join(__dirname, 'attached_assets/mp_hexagonal_tech_logo_1766320057712_1766443429909.webp');
const outputPath = path.join(__dirname, 'attached_assets/mp_hexagonal_tech_logo_transparent.png');

sharp(inputPath)
  .ensureAlpha()
  .png()
  .toFile(outputPath)
  .then(info => {
    console.log('✓ Logo converted successfully');
    console.log('Saved to:', outputPath);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
