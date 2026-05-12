import sharp from 'sharp';

const input = './public/avatar.png';
const output = './public/avatar_processed.png';

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const pixels = new Uint8Array(data);

// For each pixel: if it's near-black (r+g+b < 80), make it transparent
// Also smooth edges with partial transparency for near-black pixels (40-120 brightness sum)
for (let i = 0; i < pixels.length; i += channels) {
  const r = pixels[i];
  const g = pixels[i + 1];
  const b = pixels[i + 2];
  const brightness = r + g + b;

  if (brightness < 60) {
    // Pure black → fully transparent
    pixels[i + 3] = 0;
  } else if (brightness < 120) {
    // Near-black → partial transparency (smooth edge)
    const alpha = Math.round(((brightness - 60) / 60) * 255);
    pixels[i + 3] = alpha;
  }
  // Brighter pixels keep their full alpha
}

await sharp(pixels, {
  raw: { width, height, channels }
})
  .png()
  .toFile(output);

console.log('✅ Background removed → public/avatar.png');
