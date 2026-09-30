import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

// SVG string for regular PWA icon (rose background, white Torii / Nihongo glyph)
function getSvg(size) {
  const fontSize = Math.round(size * 0.38);
  const subFontSize = Math.round(size * 0.16);
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#E11D48"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.36}" fill="#BE123C"/>
  <text x="50%" y="45%" text-anchor="middle" dominant-baseline="central" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#FFFFFF">日</text>
  <text x="50%" y="78%" text-anchor="middle" dominant-baseline="central" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${subFontSize}" font-weight="bold" fill="#FFE4E6">हिन्दी</text>
</svg>`;
}

// SVG string for maskable icon (full bleed background, inner content within 80% safe zone)
function getMaskableSvg(size) {
  const fontSize = Math.round(size * 0.32);
  const subFontSize = Math.round(size * 0.14);
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#E11D48"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.32}" fill="#BE123C"/>
  <text x="50%" y="46%" text-anchor="middle" dominant-baseline="central" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#FFFFFF">日</text>
  <text x="50%" y="74%" text-anchor="middle" dominant-baseline="central" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${subFontSize}" font-weight="bold" fill="#FFE4E6">हिन्दी</text>
</svg>`;
}

async function generateIcons() {
  console.log('Generating PWA PNG icons using sharp...');

  const icon192Path = path.join(publicDir, 'icon-192.png');
  const icon512Path = path.join(publicDir, 'icon-512.png');
  const maskable192Path = path.join(publicDir, 'icon-maskable-192.png');
  const maskable512Path = path.join(publicDir, 'icon-maskable-512.png');

  await sharp(Buffer.from(getSvg(192))).png().toFile(icon192Path);
  console.log(`✅ Generated: ${icon192Path}`);

  await sharp(Buffer.from(getSvg(512))).png().toFile(icon512Path);
  console.log(`✅ Generated: ${icon512Path}`);

  await sharp(Buffer.from(getMaskableSvg(192))).png().toFile(maskable192Path);
  console.log(`✅ Generated: ${maskable192Path}`);

  await sharp(Buffer.from(getMaskableSvg(512))).png().toFile(maskable512Path);
  console.log(`✅ Generated: ${maskable512Path}`);

  console.log('All PWA icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Failed to generate PWA icons:', err);
  process.exit(1);
});
