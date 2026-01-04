import { fileURLToPath } from 'node:url';
import path from 'path';
import replace, { type ReplaceResult } from 'replace-in-file';

const regex =
  /<script([^>]*)src="(\/assets\/main-[^.]+\.js)"([^>]*)><\/script>/g;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

replace
  .replaceInFile({
    files: path.join(__dirname, '../dist/index.html'),
    from: regex,
    to: '<script$1src="$2"$3 data-cookieconsent="ignore"></script>',
  })
  .then((results: ReplaceResult[]) => {
    if (results.length === 0 || results[0].hasChanged === false) {
      // No replacements were made => throw error
      console.error(
        `Failed to add cookiebot ignore attributes. Regex not found: ${regex.source}`,
      );
      process.exit(1);
    } else {
      // Replacement was made
      console.info('Successfully added cookiebot ignore attributes:', results);
      process.exit(0);
    }
  })
  .catch((error: any) => {
    console.error('Failed to add cookiebot ignore attributes', error);
    process.exit(1);
  });
