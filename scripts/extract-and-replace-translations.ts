import * as fs from 'fs';
import glob from 'glob';
import * as _ from 'lodash';
import * as path from 'path';
import oldTranslations from '../src/shared/translations/nl.json';
const sortObject = require('sort-object-keys');

function getFormattedKey(filePath: string, key: string) {
	const fileKey = filePath
		.replace(/[\\\/]+/g, '/')
		.split('.')[0]
		.split(/[\\\/]/g)
		.map(part => _.kebabCase(part))
		.join('/')
		.toLowerCase()
		.replace(/(^\/+|\/+$)/g, '')
		.trim();
	const formattedKey = _.kebabCase(key);
	return `${fileKey}___${formattedKey}`;
}

const options = {
	ignore: '**/*.d.ts',
	cwd: path.join(__dirname, '../src'),
};

glob('**/*.@(ts|tsx)', options, (err, files) => {
	if (err) {
		console.error('Failed to extract translations', err);
		return;
	}

	const newTranslations: { [key: string]: string } = {};

	// Find and extract translations, replace strings with translation keys
	files.forEach((relativeFilePath: string) => {
		try {
			const absoluteFilePath = `${options.cwd}/${relativeFilePath}`;
			let content: string = fs.readFileSync(absoluteFilePath).toString();

			// Replace Trans objects
			content = content.replace(
				/<Trans( i18nKey="([^"]+)")?>([\s\S]*?)<\/Trans>/g,
				(match: string, keyAttribute: string, key: string, defaultString: string) => {
					let formattedKey: string | undefined = key;
					const trimmedDefaultString: string = defaultString.trim();
					if (!key) {
						// new Trans without a key
						formattedKey = getFormattedKey(relativeFilePath, trimmedDefaultString);
					}
					newTranslations[formattedKey] = trimmedDefaultString.trim();
					return `<Trans i18nKey="${formattedKey}">${trimmedDefaultString}</Trans>`;
				}
			);

			// Replace t() functions ( including i18n.t() )
			content = content.replace(
				// Match char before t function to make sure it isn't part of a bigger function name, eg: sent()
				/([^a-zA-Z])t\('([^']+)'\)/g,
				(match: string, prefix: string, defaultString: string) => {
					let formattedKey: string | undefined;
					const trimmedDefaultString: string = defaultString.trim();
					if (trimmedDefaultString.includes('___')) {
						formattedKey = trimmedDefaultString;
					} else {
						formattedKey = getFormattedKey(relativeFilePath, trimmedDefaultString);
					}
					newTranslations[formattedKey] = trimmedDefaultString;
					return `${prefix}t('${formattedKey}')`;
				}
			);

			fs.writeFileSync(absoluteFilePath, content);
		} catch (err) {
			console.error(`Failed to find translations in file: ${relativeFilePath}`, err);
		}
	});

	// Compare existing translations to the new translations
	const oldTranslationKeys: string[] = _.keys(oldTranslations);
	const newTranslationKeys: string[] = _.keys(newTranslations);
	const addedTranslationKeys: string[] = _.without(newTranslationKeys, ...oldTranslationKeys);
	const removedTranslationKeys: string[] = _.without(oldTranslationKeys, ...newTranslationKeys);
	const existingTranslationKeys: string[] = _.intersection(newTranslationKeys, oldTranslationKeys);

	// Console log translations that were found in the json file but not in the code
	console.warn(
		`The following translation keys were removed: 
\t${removedTranslationKeys.join('\n\t')}`
	);

	// Combine the translations in the json with the freshly extracted translations from the code
	const combinedTranslations: { [key: string]: string } = {};
	existingTranslationKeys.forEach(
		key => (combinedTranslations[key] = (oldTranslations as { [key: string]: string })[key])
	);
	addedTranslationKeys.forEach(key => (combinedTranslations[key] = newTranslations[key]));

	fs.writeFileSync(
		`${__dirname.replace(/\\/g, '/')}/../src/shared/translations/nl.json`,
		JSON.stringify(sortObject(combinedTranslations), null, 2)
	);

	const totalTranslations = existingTranslationKeys.length + addedTranslationKeys.length;
	console.log(
		`Wrote ${totalTranslations} src/shared/translations/nl.json file
\t${addedTranslationKeys.length} translations added
\t${removedTranslationKeys.length} translations deleted`
	);
});
