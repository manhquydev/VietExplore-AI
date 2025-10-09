/**
 * Generate PWA Icons Script for Du Lich Viet
 *
 * This script generates all required PWA icons from the source SVG logo.
 * Requires: sharp (already installed in project)
 *
 * Usage: node scripts/generate-pwa-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_ICON = path.join(__dirname, '../public/logo-icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// Icon sizes required for PWA
const ICON_SIZES = [
  { size: 72, name: 'icon-72x72.png', maskable: false },
  { size: 96, name: 'icon-96x96.png', maskable: false },
  { size: 128, name: 'icon-128x128.png', maskable: false },
  { size: 144, name: 'icon-144x144.png', maskable: false },
  { size: 152, name: 'icon-152x152.png', maskable: false },
  { size: 192, name: 'icon-192x192.png', maskable: false },
  { size: 384, name: 'icon-384x384.png', maskable: false },
  { size: 512, name: 'icon-512x512.png', maskable: false },
  { size: 192, name: 'icon-192x192-maskable.png', maskable: true },
  { size: 512, name: 'icon-512x512-maskable.png', maskable: true },
];

// Shortcut icons
const SHORTCUT_ICONS = [
  { size: 96, name: 'explore-96x96.png', color: '#16A34A' },
  { size: 96, name: 'saved-96x96.png', color: '#F59E0B' },
  { size: 96, name: 'profile-96x96.png', color: '#3B82F6' },
];

// Apple Touch Icon
const APPLE_ICON = { size: 180, name: 'apple-touch-icon.png' };

/**
 * Generate a single icon with optional padding for maskable icons
 */
async function generateIcon(size, outputPath, maskable = false) {
  try {
    const padding = maskable ? Math.floor(size * 0.1) : 0; // 10% padding for maskable
    const iconSize = size - (padding * 2);

    // Read SVG and resize
    const svgBuffer = fs.readFileSync(SOURCE_ICON);

    let image = sharp(svgBuffer)
      .resize(iconSize, iconSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
      });

    // Add padding for maskable icons
    if (maskable) {
      image = image.extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 255, g: 255, b: 255, alpha: 1 } // White background for maskable
      });
    }

    // Generate PNG
    await image.png({ quality: 100 }).toFile(outputPath);

    console.log(`✅ Generated: ${path.basename(outputPath)} (${size}x${size}${maskable ? ' maskable' : ''})`);
  } catch (error) {
    console.error(`❌ Failed to generate ${outputPath}:`, error.message);
  }
}

/**
 * Generate shortcut icons with colored backgrounds
 */
async function generateShortcutIcon(size, outputPath, color) {
  try {
    const padding = Math.floor(size * 0.2); // 20% padding
    const iconSize = size - (padding * 2);

    const svgBuffer = fs.readFileSync(SOURCE_ICON);

    // Parse hex color
    const colorRgb = {
      r: parseInt(color.slice(1, 3), 16),
      g: parseInt(color.slice(3, 5), 16),
      b: parseInt(color.slice(5, 7), 16),
      alpha: 1
    };

    await sharp(svgBuffer)
      .resize(iconSize, iconSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: colorRgb
      })
      .png({ quality: 100 })
      .toFile(outputPath);

    console.log(`✅ Generated shortcut: ${path.basename(outputPath)} (${color})`);
  } catch (error) {
    console.error(`❌ Failed to generate ${outputPath}:`, error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting PWA Icons Generation for Du Lich Viet...\n');

  // Check if source icon exists
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`❌ Source icon not found: ${SOURCE_ICON}`);
    console.error('Please ensure logo-icon.svg exists in public/ folder.');
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}\n`);
  }

  // Generate main PWA icons
  console.log('📱 Generating PWA icons...');
  for (const config of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, config.name);
    await generateIcon(config.size, outputPath, config.maskable);
  }

  console.log('\n🎯 Generating shortcut icons...');
  for (const config of SHORTCUT_ICONS) {
    const outputPath = path.join(OUTPUT_DIR, config.name);
    await generateShortcutIcon(config.size, outputPath, config.color);
  }

  // Generate Apple Touch Icon
  console.log('\n🍎 Generating Apple Touch Icon...');
  const appleIconPath = path.join(OUTPUT_DIR, APPLE_ICON.name);
  await generateIcon(APPLE_ICON.size, appleIconPath, false);

  console.log('\n✨ PWA Icons generation complete!');
  console.log(`📂 All icons saved to: ${OUTPUT_DIR}`);
  console.log('\n📋 Next steps:');
  console.log('   1. Verify icons in public/icons/ folder');
  console.log('   2. Update manifest.json icon paths (already done)');
  console.log('   3. Run "npm run build" to test PWA integration');
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
