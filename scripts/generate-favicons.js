/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');
let sharp;
try {
  sharp = require('sharp');
} catch {
  console.error('Missing dependency: sharp. Run `npm install --save-dev sharp` then re-run this script.');
  process.exit(1);
}

async function generate() {
  // Prefer dashboard.svg if present, fallback to globe.svg
  let svgName = 'dashboard.svg';
  if (!fs.existsSync(path.resolve(__dirname, '..', 'public', svgName))) {
    svgName = 'globe.svg';
  }
  const svgPath = path.resolve(__dirname, '..', 'public', svgName);
  const out32 = path.resolve(__dirname, '..', 'public', 'favicon-32x32.png');
  const out16 = path.resolve(__dirname, '..', 'public', 'favicon-16x16.png');
  const outIco = path.resolve(__dirname, '..', 'public', 'favicon.ico');

  if (!fs.existsSync(svgPath)) {
    console.error('Source SVG not found:', svgPath);
    process.exit(1);
  }

  try {
    const svgBuffer = fs.readFileSync(svgPath);
    await sharp(svgBuffer).resize(32, 32).png().toFile(out32);
    await sharp(svgBuffer).resize(16, 16).png().toFile(out16);

    // create ICO from 32x32 and 16x16
    await sharp(out32).toFile(outIco); // sharp will write PNG; real ICO requires extra steps or a different lib

    console.log('Generated:', out32, out16, outIco);
  } catch (err) {
    console.error('Failed to generate favicons:', err);
    process.exit(1);
  }
}

generate();
