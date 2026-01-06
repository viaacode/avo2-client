import fs from "fs";
import path from "path";

const WD = '/app';
const enableGoogleIndexing = process.env.ENABLE_GOOGLE_INDEXING === 'true';

console.log('copy robots.txt file');
console.log('files in scripts folder:', fs.readdirSync(path.join(WD, 'scripts')));

const srcFile = enableGoogleIndexing
	? path.join(WD, 'scripts', 'robots-enable-indexing.txt')
	: path.join(WD, 'scripts', 'robots-disable-indexing.txt');
const destFile = path.join(WD, 'dist', 'client', 'robots.txt');

fs.copyFileSync(srcFile, destFile);

// Remove both source files
fs.rmSync(path.join(WD, 'scripts', 'robots-enable-indexing.txt'), { force: true });
fs.rmSync(path.join(WD, 'scripts', 'robots-disable-indexing.txt'), { force: true });
