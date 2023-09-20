import path from 'path';

import replace, { ReplaceResult } from 'replace-in-file';

replace
	.replaceInFile({
		files: path.join(__dirname, '../dist/index.html'),
		from: /<script defer="defer" src="(\/static\/js\/main\.[^.]+\.js)"><\/script>/g,
		to: '<script defer="defer" src="$1" data-cookieconsent="ignore"></script>',
	})
	.then((results: ReplaceResult[]) => {
		console.info('Successfully added cookiebot ignore attributes:', results);
	})
	.catch((error: any) => {
		console.error('Failed to add cookiebot ignore attributes', error);
	});
