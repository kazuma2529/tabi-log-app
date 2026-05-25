// 簡易バリデーション。TS構文を最小限パースして検証する。
import fs from 'node:fs';

const src = fs.readFileSync('src/data/countries.ts', 'utf8');
const constSrc = fs.readFileSync('src/constants/app.ts', 'utf8');

// 全 country オブジェクトを抽出
const countryRegex = /\{ id: '([a-z]{2})', isoCode: '([A-Z]{2})', nameJa: '([^']+)', nameEn: '(.*?)', flag: '([^']+)', region: '([^']+)', continent: '([^']+)', mapX: ([\d.]+), mapY: ([\d.]+), accent: '(#[0-9A-Fa-f]{6})' \}/g;
const countries = [];
let m;
while ((m = countryRegex.exec(src)) !== null) {
  countries.push({
    id: m[1], isoCode: m[2], nameJa: m[3], nameEn: m[4],
    flag: m[5], region: m[6], continent: m[7],
    mapX: parseFloat(m[8]), mapY: parseFloat(m[9]), accent: m[10],
  });
}

console.log(`Total countries: ${countries.length}`);

// REGION_TARGETS を取得
const targetMatch = constSrc.match(/REGION_TARGETS\s*=\s*\{([^}]+)\}/);
const targets = {};
for (const line of targetMatch[1].split(',')) {
  const t = line.trim().match(/(\S+):\s*(\d+)/);
  if (t) targets[t[1]] = parseInt(t[2], 10);
}
console.log('REGION_TARGETS:', targets);

// 地域別カウント
const byRegion = {};
for (const c of countries) {
  byRegion[c.region] = (byRegion[c.region] ?? 0) + 1;
}
console.log('Actual by region:', byRegion);

// 一致確認
let pass = true;
for (const [region, target] of Object.entries(targets)) {
  const actual = byRegion[region] ?? 0;
  if (actual !== target) {
    console.error(`MISMATCH: ${region} expected ${target}, got ${actual}`);
    pass = false;
  }
}

// 必須条件
const hasJp = countries.some((c) => c.id === 'jp');
const hasTw = countries.some((c) => c.id === 'tw');
if (hasJp) { console.error('Japan still present!'); pass = false; }
if (!hasTw) { console.error('Taiwan missing!'); pass = false; }

// 重複
const ids = new Set();
const dupIds = [];
for (const c of countries) {
  if (ids.has(c.id)) dupIds.push(c.id);
  ids.add(c.id);
}
if (dupIds.length) { console.error('Duplicate IDs:', dupIds); pass = false; }

// 値域
const oor = countries.filter((c) => c.mapX < 0 || c.mapX > 100 || c.mapY < 0 || c.mapY > 100);
if (oor.length) { console.error('Out of range:', oor.map((c) => c.id)); pass = false; }

// 既存38か国の値が変わっていないか
const ORIGINAL_EXISTING = {
  th: { mapX: 67, mapY: 52, accent: '#2F6EB5' },
  kr: { mapX: 75, mapY: 36, accent: '#315B9B' },
  sg: { mapX: 68, mapY: 62, accent: '#D9363E' },
  vn: { mapX: 70, mapY: 53, accent: '#D62828' },
  id: { mapX: 72, mapY: 68, accent: '#C83D3D' },
  cn: { mapX: 68, mapY: 35, accent: '#D62C2C' },
  tw: { mapX: 75, mapY: 45, accent: '#365BB7' },
  in: { mapX: 57, mapY: 49, accent: '#EF8B2C' },
  my: { mapX: 67, mapY: 61, accent: '#244F9E' },
  ph: { mapX: 77, mapY: 55, accent: '#3158A8' },
  tr: { mapX: 50, mapY: 35, accent: '#D73838' },
  it: { mapX: 45, mapY: 36, accent: '#2D9B63' },
  fr: { mapX: 41, mapY: 34, accent: '#315AAB' },
  es: { mapX: 39, mapY: 39, accent: '#D8A22A' },
  de: { mapX: 43, mapY: 31, accent: '#36312C' },
  gb: { mapX: 39, mapY: 29, accent: '#325AA8' },
  is: { mapX: 35, mapY: 21, accent: '#3167A8' },
  pt: { mapX: 37, mapY: 39, accent: '#2A9566' },
  nl: { mapX: 42, mapY: 30, accent: '#D76738' },
  gr: { mapX: 47, mapY: 40, accent: '#2C84C8' },
  fi: { mapX: 47, mapY: 23, accent: '#3B6FA7' },
  us: { mapX: 20, mapY: 37, accent: '#3159A4' },
  ca: { mapX: 18, mapY: 25, accent: '#D54242' },
  mx: { mapX: 20, mapY: 49, accent: '#279B64' },
  cu: { mapX: 27, mapY: 51, accent: '#3267A8' },
  pe: { mapX: 31, mapY: 70, accent: '#C83D3D' },
  br: { mapX: 36, mapY: 70, accent: '#36A666' },
  ar: { mapX: 33, mapY: 83, accent: '#5CA7D8' },
  cl: { mapX: 30, mapY: 82, accent: '#D74747' },
  co: { mapX: 31, mapY: 61, accent: '#DAB334' },
  ma: { mapX: 43, mapY: 48, accent: '#C73737' },
  eg: { mapX: 51, mapY: 48, accent: '#C84141' },
  za: { mapX: 52, mapY: 82, accent: '#2D9B63' },
  ke: { mapX: 56, mapY: 64, accent: '#2F8B57' },
  au: { mapX: 79, mapY: 78, accent: '#315DAB' },
  nz: { mapX: 87, mapY: 86, accent: '#315DAB' },
  fj: { mapX: 91, mapY: 75, accent: '#62ADD7' },
};
const byId = Object.fromEntries(countries.map((c) => [c.id, c]));
let unchanged = 0;
let changed = [];
for (const [id, orig] of Object.entries(ORIGINAL_EXISTING)) {
  const c = byId[id];
  if (!c) { changed.push(`${id}: missing`); continue; }
  if (c.mapX !== orig.mapX || c.mapY !== orig.mapY || c.accent !== orig.accent) {
    changed.push(`${id}: mapX ${c.mapX}/${orig.mapX} mapY ${c.mapY}/${orig.mapY} accent ${c.accent}/${orig.accent}`);
  } else {
    unchanged++;
  }
}
console.log(`Existing kept unchanged: ${unchanged}/37`);
if (changed.length) {
  console.error('Existing changed:', changed);
  pass = false;
}

console.log(pass ? '✓ ALL CHECKS PASSED' : '✗ SOME CHECKS FAILED');
process.exit(pass ? 0 : 1);
