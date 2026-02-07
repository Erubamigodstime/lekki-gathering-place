/**
 * PWA Icon Generator Script
 * 
 * Generates all required PWA icon sizes from the source logo
 * Run with: node scripts/generate-icons.js
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_LOGO = path.join(__dirname, '../public/images/logo-dark.jpeg');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// Icon sizes required for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created directory: ${OUTPUT_DIR}`);
  }

  // Check if source logo exists
  if (!fs.existsSync(SOURCE_LOGO)) {
    console.error(`❌ Source logo not found: ${SOURCE_LOGO}`);
    console.log('Please ensure logo.png exists in public/images/');
    process.exit(1);
  }

  console.log(`📷 Source logo: ${SOURCE_LOGO}\n`);

  // Generate each icon size
  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    
    try {
      await sharp(SOURCE_LOGO)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 30, g: 58, b: 95, alpha: 1 }, // #1e3a5f - brand color
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Failed to generate ${size}x${size}: ${error.message}`);
    }
  }

  // Generate Apple Touch Icon (180x180)
  const appleTouchIcon = path.join(OUTPUT_DIR, 'apple-touch-icon.png');
  try {
    await sharp(SOURCE_LOGO)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 30, g: 58, b: 95, alpha: 1 },
      })
      .png()
      .toFile(appleTouchIcon);
    
    console.log(`✅ Generated: apple-touch-icon.png (180x180)`);
  } catch (error) {
    console.error(`❌ Failed to generate apple-touch-icon: ${error.message}`);
  }

  // Generate maskable icon (with padding for safe zone)
  const maskableIcon = path.join(OUTPUT_DIR, 'maskable-icon-512x512.png');
  try {
    // Maskable icons need 10% padding on each side (safe zone)
    const safeSize = Math.floor(512 * 0.8); // 80% of 512
    
    await sharp(SOURCE_LOGO)
      .resize(safeSize, safeSize, {
        fit: 'contain',
        background: { r: 30, g: 58, b: 95, alpha: 1 },
      })
      .extend({
        top: Math.floor((512 - safeSize) / 2),
        bottom: Math.ceil((512 - safeSize) / 2),
        left: Math.floor((512 - safeSize) / 2),
        right: Math.ceil((512 - safeSize) / 2),
        background: { r: 30, g: 58, b: 95, alpha: 1 },
      })
      .png()
      .toFile(maskableIcon);
    
    console.log(`✅ Generated: maskable-icon-512x512.png (with safe zone)`);
  } catch (error) {
    console.error(`❌ Failed to generate maskable icon: ${error.message}`);
  }

  console.log('\n🎉 PWA icon generation complete!');
  console.log(`📁 Icons saved to: ${OUTPUT_DIR}`);
}

generateIcons().catch(console.error);
