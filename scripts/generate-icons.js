/**
 * Generate PWA icons from SVG
 * Run: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Simple SVG icon with shield
const svgContent = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#6c5ce7" rx="80"/>
  <path d="M256 80 L160 120 L160 240 Q160 360 256 432 Q352 360 352 240 L352 120 Z" fill="#ffffff" stroke="#ffffff" stroke-width="8"/>
  <text x="256" y="280" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="#6c5ce7" text-anchor="middle">R</text>
</svg>`;

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Write SVG files (browsers support SVG as icons)
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.svg'), svgContent);
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.svg'), svgContent);

console.log('✓ Icons generated successfully');
console.log('Note: For production, convert these SVGs to PNG using an image tool');
