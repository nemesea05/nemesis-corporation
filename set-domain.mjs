// Usage: node set-domain.mjs https://your-real-domain.com
// Replaces the site address in every page, the sitemap and robots.txt.
// It finds the current address by itself, so you can run it again whenever the address changes.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const next = (process.argv[2] || '').replace(/\/+$/, '');
if (!/^https:\/\/[^\s/]+$/.test(next)) {
  console.error('Give the full address, for example: node set-domain.mjs https://nemesis-corporation.vercel.app');
  process.exit(1);
}
const match = readFileSync('robots.txt', 'utf8').match(/Sitemap:\s*(https:\/\/[^\s/]+)\/sitemap\.xml/);
if (!match) { console.error('Could not find the current address in robots.txt'); process.exit(1); }
const OLD = match[1];

let n = 0;
for (const f of readdirSync('.').filter((f) => /\.(html|xml|txt)$/.test(f))) {
  const s = readFileSync(f, 'utf8');
  if (s.includes(OLD)) { writeFileSync(f, s.split(OLD).join(next)); n++; console.log('updated', f); }
}
console.log(n ? `Done. ${n} files now use ${next} (was ${OLD}).` : 'Nothing to change.');
