import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'dist');
const output = resolve(root, 'vercel-dist');
const originalOrigin = 'https://juanfra-ruiz.juanfrancisco-agroju.chatgpt.site';
const configuredOrigin = process.env.SITE_URL
  || process.env.VERCEL_PROJECT_PRODUCTION_URL
  || process.env.VERCEL_URL;

let origin = originalOrigin;
if (configuredOrigin) {
  const url = new URL(configuredOrigin.includes('://') ? configuredOrigin : `https://${configuredOrigin}`);
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('SITE_URL must be an HTTPS website address.');
  }
  origin = url.origin;
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, {
  recursive: true,
  filter: path => !path.endsWith('.zip'),
});

for (const route of ['index.html', 'eventos/index.html']) {
  const path = resolve(output, route);
  const html = await readFile(path, 'utf8');
  await writeFile(path, html.replaceAll(originalOrigin, origin));
}

console.log('Vercel build ready: homepage, social-events page and local assets.');
