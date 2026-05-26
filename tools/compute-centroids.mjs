import fs from 'node:fs';

const src = fs.readFileSync('src/data/world-country-paths.ts', 'utf8');
const matches = [...src.matchAll(/"isoCode":\s*"([A-Z]{2})"[\s\S]*?"path":\s*"([^"]+)"/g)];

const VIEW_W = 360;
const VIEW_H = 198;

function parseCoords(d) {
  // Strip commands and turn into number sequences.
  // Then read pairs of numbers; for arc 'A' commands collect only the endpoint pair.
  // For 'C' (cubic) commands, the endpoint is the last of 3 pairs (we only want vertices on the boundary).
  // We'll do a simpler approach: gather ALL number pairs and use them for centroid.
  // This biases toward dense areas (more control points = more weight), but it's good enough
  // for fixing labels.
  const tokens = d.match(/-?\d+(?:\.\d+)?/g);
  if (!tokens) return [];
  const points = [];
  for (let i = 0; i + 1 < tokens.length; i += 2) {
    const x = parseFloat(tokens[i]);
    const y = parseFloat(tokens[i + 1]);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      points.push([x, y]);
    }
  }
  return points;
}

const result = {};
for (const m of matches) {
  const iso = m[1];
  const path = m[2];
  const pts = parseCoords(path);
  if (pts.length === 0) continue;
  // Bounding box center + simple centroid average
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let sumX = 0, sumY = 0;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    sumX += x;
    sumY += y;
  }
  const cxAvg = sumX / pts.length;
  const cyAvg = sumY / pts.length;
  const cxBox = (minX + maxX) / 2;
  const cyBox = (minY + maxY) / 2;
  // Use 60% average + 40% bbox to handle skewed shapes a bit better
  const cx = cxAvg * 0.6 + cxBox * 0.4;
  const cy = cyAvg * 0.6 + cyBox * 0.4;
  const mapX = +((cx / VIEW_W) * 100).toFixed(2);
  const mapY = +((cy / VIEW_H) * 100).toFixed(2);
  result[iso] = { mapX, mapY };
}

const ordered = Object.fromEntries(Object.entries(result).sort(([a],[b]) => a.localeCompare(b)));
console.log(JSON.stringify(ordered, null, 2));
