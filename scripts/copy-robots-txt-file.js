import fs from 'fs';
import path from 'path';

console.info('copying robots.txt dist folder...');

const WD = '/app';
const enableGoogleIndexing = process.env.ENABLE_GOOGLE_INDEXING === 'true';

const srcFile = enableGoogleIndexing
  ? path.join(WD, 'scripts', 'robots-enable-indexing.txt')
  : path.join(WD, 'scripts', 'robots-disable-indexing.txt');
const destFile = path.join(WD, 'dist', 'client', 'robots.txt');

// Copy correct robots.txt file
fs.writeFileSync(destFile, fs.readFileSync(srcFile, 'utf8'));

// Remove both source files
fs.rmSync(path.join(WD, 'scripts', 'robots-enable-indexing.txt'), {
  force: true,
});
fs.rmSync(path.join(WD, 'scripts', 'robots-disable-indexing.txt'), {
  force: true,
});

console.info('copying robots.txt dist folder... done');
