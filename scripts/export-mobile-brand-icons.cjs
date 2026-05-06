/**
 * Rasterize web brand SVGs into Expo asset PNGs (see apps/mobile/app.json paths).
 * Run from repo root: npm run mobile:icons
 */
const fs = require("fs");
const path = require("path");

const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const brandDir = path.join(root, "public", "brand");
const outDir = path.join(root, "apps", "mobile", "assets");

const ICON = path.join(brandDir, "app-icon-dark.svg");
const WORDMARK_COMPACT = path.join(brandDir, "wordmark-compact.svg");
const SECONDARY_MARK = path.join(brandDir, "secondary-mark.svg");

/** Matches apps/mobile splash + app chrome (Tailwind stone). */
const STONE_SPLASH_BG = "#F6F4F0";

function rasterizeSvg(svgPath, size) {
  return sharp(svgPath).resize(size, size).png({ compressionLevel: 9 });
}

async function writeWordmarkPng(sourceSvg, filename, widthPx) {
  if (!fs.existsSync(sourceSvg)) {
    console.warn(`Skip wordmark raster: missing ${sourceSvg}`);
    return;
  }
  await sharp(sourceSvg)
    .resize({ width: widthPx })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, filename));
}

async function main() {
  if (!fs.existsSync(ICON)) {
    throw new Error(`Missing brand source: ${ICON}`);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const icon1024 = rasterizeSvg(ICON, 1024);
  await icon1024.clone().toFile(path.join(outDir, "icon.png"));
  await icon1024.clone().toFile(path.join(outDir, "adaptive-icon.png"));

  /** Centered foreground on solid splash background (matches app.json splash background). */
  const splashW = 1284;
  const splashH = 2778;
  const foregroundPx = Math.round(Math.min(splashW, splashH) * 0.28);
  const fgBuf = await rasterizeSvg(ICON, foregroundPx).toBuffer();
  await sharp({
    create: {
      width: splashW,
      height: splashH,
      channels: 3,
      background: STONE_SPLASH_BG,
    },
  })
    .composite([
      {
        input: fgBuf,
        left: Math.round((splashW - foregroundPx) / 2),
        top: Math.round((splashH - foregroundPx) / 2),
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, "splash-icon.png"));

  await rasterizeSvg(ICON, 48).toFile(path.join(outDir, "favicon.png"));

  await writeWordmarkPng(WORDMARK_COMPACT, "wordmark-compact-mobile.png", 720);
  await writeWordmarkPng(SECONDARY_MARK, "secondary-mark-mobile.png", 144);

  console.log(
    "Wrote apps/mobile/assets/{icon,adaptive-icon,splash-icon,favicon,wordmark-compact-mobile,secondary-mark-mobile}.png from public/brand.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
