// Stamps public/version.json with a fresh build id before every production
// build. This file is served at a fixed, unhashed URL (/version.json), so
// the running app can poll it to notice a new deploy without re-downloading
// the whole JS bundle — see src/components/UpdateWatcher.tsx.
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const outPath = join(publicDir, 'version.json');

const version = String(Date.now());

mkdirSync(publicDir, { recursive: true });
writeFileSync(outPath, JSON.stringify({ version }), 'utf-8');

console.log(`[write-version] wrote build version ${version} to public/version.json`);
