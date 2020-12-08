import path from 'path';
import replace, { ReplaceResult } from 'replace-in-file';

replace
	.replaceInFile({
		files: path.join(__dirname, '../build/index.html'),
		from: /<script src="(.*?\.chunk.js)"><\/script><script src="(.*?\.chunk.js)"><\/script><\/body><\/html>/g,
		to:
			'<script src="$1" data-cookieconsent="ignore"></script><script src="$2" data-cookieconsent="ignore"></script></body></html>',
	})
	.then((results: ReplaceResult[]) => {
		console.info('Succesfully added cookiebot ignore attributes:', results);
	})
	.catch((error: any) => {
		console.error('Failed to add cookiebot ignore attributes', error);
	});
