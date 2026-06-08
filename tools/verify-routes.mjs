import fs from 'node:fs';
import path from 'node:path';

const APP_DIR = 'app';
const ROUTE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const INTERNAL_SEGMENT = /^_/;
const ALLOWED_TAB_ROUTES = new Set([
  '(tabs)/_layout.tsx',
  '(tabs)/add-button.tsx',
  '(tabs)/diary.tsx',
  '(tabs)/index.tsx',
  '(tabs)/map.tsx',
  '(tabs)/stats.tsx',
]);

function collectRouteFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectRouteFiles(entryPath);
    return ROUTE_EXTENSIONS.has(path.extname(entry.name)) ? [entryPath] : [];
  });
}

const errors = [];

for (const routeFile of collectRouteFiles(APP_DIR)) {
  const relativePath = path.relative(APP_DIR, routeFile);
  const segments = relativePath.split(path.sep);
  const fileName = segments.at(-1);
  const internalSegments = segments.slice(0, -1).filter((segment) => INTERNAL_SEGMENT.test(segment));

  if (internalSegments.length > 0) {
    errors.push(`${relativePath}: app/ 配下に内部実装ディレクトリを置かないでください`);
  }

  if (INTERNAL_SEGMENT.test(fileName) && !fileName.startsWith('_layout.')) {
    errors.push(`${relativePath}: app/ 配下の内部実装ファイルは公開ルートになります`);
  }

  if (relativePath.startsWith(`(tabs)${path.sep}`) && !ALLOWED_TAB_ROUTES.has(relativePath)) {
    errors.push(`${relativePath}: 許可されていないファイルは余計なタブとして表示されます`);
  }

  const source = fs.readFileSync(routeFile, 'utf8');
  if (!/\bexport\s+default\b/.test(source)) {
    errors.push(`${relativePath}: 公開ルートには default export が必要です`);
  }
}

if (errors.length > 0) {
  console.error('Route audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Route audit passed.');
