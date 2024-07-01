import path from 'path';

import replace, { type ReplaceResult } from 'replace-in-file';

replace
	.replaceInFile({
		files: path.join(__dirname, '../dist/index.html'),
		from: /<script([^>]*)src="(\/assets\/index-[^.]+\.js)"([^>]*)><\/script>/g,
		to: '<script$1src="$2"$3 data-cookieconsent="ignore"></script>',
	})
	.then((results: ReplaceResult[]) => {
		console.info('Successfully added cookiebot ignore attributes:', results);
	})
	.catch((error: any) => {
		console.error('Failed to add cookiebot ignore attributes', error);
	});
