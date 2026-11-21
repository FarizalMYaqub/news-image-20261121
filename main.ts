// news-image-20261121 — one-image entry, Node 22, standard library only.
//
// The front page that sums up the world news of Saturday 21 November 2026
// lives in entry.png beside this file (hand-drawn HTML/CSS/SVG, rendered
// once to PNG). This program copies it to the output directory the grader
// provides, so every run writes byte-identical output.
//
// Run locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });

const from = join(here, "entry.png");
const to = join(outDir, "entry.png");
copyFileSync(from, to);

const copied = statSync(to);
const source = statSync(from);
if (copied.size === 0 || copied.size > 1048576) {
  throw new Error(`entry.png is ${copied.size} bytes, outside the 1 MiB cap`);
}
if (copied.size !== source.size) {
  throw new Error(`entry.png copy is ${copied.size} bytes, source is ${source.size}`);
}

const png = readFileSync(to);
const magic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const end = Buffer.concat([
  Buffer.from([0, 0, 0, 0]),
  Buffer.from("IEND"),
  Buffer.from([0xae, 0x42, 0x60, 0x82]),
]);
if (!png.subarray(0, 8).equals(magic) || !png.subarray(-12).equals(end)) {
  throw new Error("entry.png is not a complete PNG (bad header or missing IEND)");
}

// The entry must be at most 1024 by 1024 pixels: read the size straight
// from the IHDR chunk so a wrongly sized image fails here, not at grading.
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 cap`);
}
