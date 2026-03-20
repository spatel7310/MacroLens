// Generate simple SVG-based PNG icons for PWA
// Run: node scripts/generate-icons.js

import { writeFileSync } from 'fs'

function generateSVG(size) {
  const fontSize = Math.round(size * 0.4)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0f"/>
      <stop offset="100%" style="stop-color:#0d0d15"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)" rx="${Math.round(size * 0.15)}"/>
  <rect x="${Math.round(size * 0.05)}" y="${Math.round(size * 0.05)}" width="${Math.round(size * 0.9)}" height="${Math.round(size * 0.9)}" fill="none" stroke="#00f0ff" stroke-width="${Math.max(1, Math.round(size * 0.01))}" rx="${Math.round(size * 0.12)}" opacity="0.3"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="${fontSize}" fill="#00f0ff" filter="url(#glow)">IB</text>
</svg>`
}

const sizes = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
]

// Write SVGs (can be converted to PNG with a tool, but SVGs work for dev)
for (const { name, size } of sizes) {
  const svgName = name.replace('.png', '.svg')
  writeFileSync(`client/public/icons/${svgName}`, generateSVG(size))
  // Also write as "png" (it's SVG content but browsers handle it)
  writeFileSync(`client/public/icons/${name}`, generateSVG(size))
  console.log(`Generated ${name} (${size}x${size})`)
}
