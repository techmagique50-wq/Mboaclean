import sharp from 'sharp'
import { readFileSync } from 'fs'
const svg = readFileSync('public/icon.svg')
const out = [
  ['public/pwa-192.png', 192],
  ['public/pwa-512.png', 512],
  ['public/pwa-maskable-512.png', 512],
  ['public/apple-touch-icon.png', 180],
]
for (const [file, size] of out) {
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(file)
  console.log('✓', file, size)
}
