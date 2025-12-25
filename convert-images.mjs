import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = [
  'modern_auto_service_garage_workshop_interior.png',
  'modern_luxury_real_estate_agency_office.png',
  'modern_luxury_beauty_salon_interior.png'
];

const dir = path.join(__dirname, 'attached_assets/generated_images');

async function convert() {
  for (const file of files) {
    const inputPath = path.join(dir, file);
    const outputPath = path.join(dir, file.replace('.png', '.webp'));
    
    try {
      const stats = fs.statSync(inputPath);
      console.log(`Converting ${file} (${(stats.size / 1024 / 1024).toFixed(2)}MB)...`);
      
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
      
      const outStats = fs.statSync(outputPath);
      console.log(`✅ ${file.replace('.png', '.webp')} (${(outStats.size / 1024 / 1024).toFixed(2)}MB)`);
    } catch (err) {
      console.error(`❌ Error converting ${file}:`, err.message);
    }
  }
}

convert();
