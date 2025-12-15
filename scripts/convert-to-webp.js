import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const inputDir = path.join(rootDir, 'attached_assets');
const generatedImagesDir = path.join(inputDir, 'generated_images');
const stockImagesDir = path.join(inputDir, 'stock_images');

async function convertToWebP(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .webp({ quality: 85, effort: 4 })
      .toFile(outputPath);
    
    const inputStats = await stat(inputPath);
    const outputStats = await stat(outputPath);
    const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
    
    console.log(`✓ ${path.basename(inputPath)} → ${path.basename(outputPath)} (${savings}% smaller)`);
    return true;
  } catch (error) {
    console.error(`✗ Error converting ${inputPath}:`, error.message);
    return false;
  }
}

async function processDirectory(dir) {
  try {
    const files = await readdir(dir);
    const imageFiles = files.filter(f => /\.(png|jpg|jpeg)$/i.test(f));
    
    console.log(`\nProcessing ${dir}...`);
    console.log(`Found ${imageFiles.length} images to convert\n`);
    
    let converted = 0;
    for (const file of imageFiles) {
      const inputPath = path.join(dir, file);
      const outputPath = path.join(dir, file.replace(/\.(png|jpg|jpeg)$/i, '.webp'));
      
      if (await convertToWebP(inputPath, outputPath)) {
        converted++;
      }
    }
    
    console.log(`\nConverted ${converted}/${imageFiles.length} images in ${path.basename(dir)}\n`);
    return converted;
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message);
    return 0;
  }
}

async function processRootImages() {
  try {
    const files = await readdir(inputDir);
    const imageFiles = files.filter(f => /\.(png|jpg|jpeg)$/i.test(f) && !f.includes('/'));
    
    console.log(`\nProcessing root attached_assets...`);
    console.log(`Found ${imageFiles.length} images to convert\n`);
    
    let converted = 0;
    for (const file of imageFiles) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(inputDir, file.replace(/\.(png|jpg|jpeg)$/i, '.webp'));
      
      if (await convertToWebP(inputPath, outputPath)) {
        converted++;
      }
    }
    
    console.log(`\nConverted ${converted}/${imageFiles.length} root images\n`);
    return converted;
  } catch (error) {
    console.error(`Error processing root images:`, error.message);
    return 0;
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('Converting images to WebP format');
  console.log('='.repeat(50));
  
  let total = 0;
  
  total += await processRootImages();
  total += await processDirectory(generatedImagesDir);
  total += await processDirectory(stockImagesDir);
  
  console.log('='.repeat(50));
  console.log(`Total: ${total} images converted to WebP`);
  console.log('='.repeat(50));
}

main().catch(console.error);
