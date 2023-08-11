import fs from 'fs';
import path from 'path';

import glob from 'glob';
import _ from 'lodash';

async function getFilesByGlob(globPattern: string): Promise<string[]> {
	return new Promise<string[]>((resolve, reject) => {
		const options = {
			ignore: '**/*.d.ts',
			cwd: path.join(__dirname, '../src'),
		};
		glob(globPattern, options, (err, files) => {
			if (err) {
				reject(err);
			} else {
				resolve(files);
			}
		});
	});
}

async function renameFiles() {
	const filePaths = await getFilesByGlob('**/*.graphql');

	filePaths.forEach((filePath) => {
		const filePathParts = path.parse(filePath);
		const oldPath = path.resolve('src', filePath);
		const newPath = path.resolve(
			'src',
			filePathParts.dir,
			_.camelCase(filePathParts.name) + filePathParts.ext
		);
		fs.renameSync(oldPath, newPath);
	});
}

renameFiles();
