import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * MapLibre worker asset copier
 *
 * Since v6 the worker has to be pointed at explicitly when bundled. Turbopack
 * does emit it, but under a content-hashed name, which breaks the relative
 * `./maplibre-gl-shared.mjs` import the worker starts with. Copying both files
 * into `public/maplibre/` keeps them side by side, so the import resolves.
 *
 * Example usage:
 * npm run build:worker
 */

const FILES = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs'];
const TARGET_DIR = path.join('public', 'maplibre');

async function main(): Promise<void> {
  const sourceDir = path.join(
    path.dirname(require.resolve('maplibre-gl/package.json')),
    'dist'
  );

  await mkdir(TARGET_DIR, { recursive: true });
  for (const file of FILES) {
    await copyFile(path.join(sourceDir, file), path.join(TARGET_DIR, file));
    console.log(`Copied ${file} to ${TARGET_DIR}`);
  }
}

main().catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
