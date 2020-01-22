/**
 This script runs over all the code and looks for either:
 <Trans>Aanvraagformulier</Trans>
 or
 t('Aanvraagformulier')

 and replaces them with:
 <Trans i18nKey="authentication/views/registration-flow/r-4-manual-registration___aanvraagformulier">Aanvraagformulier</Trans>
 or
 t('authentication/views/registration-flow/r-4-manual-registration___aanvraagformulier')


 and it also outputs a json file with the translatable strings:
 {
  "authentication/views/registration-flow/r-4-manual-registration___aanvraagformulier": "Aanvraagformulier"
 }

 Every time the `npm run extract-translations` command is run, it will extract new translations that it finds
 (without i18nKey or not containing "___")
 and add them to the json file without overwriting the existing strings.

 We can now give the src/shared/translations/nl.json file to claire to enter the final copy.

 In the future we could add a build step to replace the translate tags with the actual translations,
 so we don't have to load the translation framework anymore and do the bindings at runtime, but this is a nice to have.
 */

import * as fs from 'fs';
import glob from 'glob';
import * as _ from 'lodash';
import * as path from 'path';
import localTranslations from '../src/shared/translations/nl.json';

const oldTranslations: { [key: string]: string } = localTranslations;

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

function getFormattedTranslation(translation: string) {
	return translation.trim().replace(/\t\t(\t)+/g, ' ');
}

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

function extractTranslationsFromCodeFiles(codeFiles: string[]) {
	const newTranslations: { [key: string]: string } = {};
	// Find and extract translations, replace strings with translation keys
	codeFiles.forEach((relativeFilePath: string) => {
		try {
			const absoluteFilePath = path.resolve(__dirname, '../src', relativeFilePath);
			let content: string = fs.readFileSync(absoluteFilePath).toString();

			// Replace Trans objects
			content = content.replace(
				/<Trans( i18nKey="([^"]+)")?>([\s\S]*?)<\/Trans>/g,
				(match: string, keyAttribute: string, key: string, translation: string) => {
					let formattedKey: string | undefined = key;
					const formattedTranslation: string = getFormattedTranslation(translation);
					if (!key) {
						// new Trans without a key
						formattedKey = getFormattedKey(relativeFilePath, formattedTranslation);
					}
					newTranslations[formattedKey] = formattedTranslation;
					return `<Trans i18nKey="${formattedKey}">${formattedTranslation}</Trans>`;
				}
			);

			// Replace t() functions ( including i18n.t() )
			content = content.replace(
				// Match char before t function to make sure it isn't part of a bigger function name, eg: sent()
				/([^a-zA-Z])t\(\s*'([\s\S]+?)'([^)]*)\)/g,
				(match: string, prefix: string, translation: string, translationParams: string) => {
					let formattedKey: string | undefined;
					const formattedTranslation: string = getFormattedTranslation(translation);
					if (formattedTranslation.includes('___')) {
						formattedKey = formattedTranslation;
					} else {
						formattedKey = getFormattedKey(relativeFilePath, formattedTranslation);
					}
					if (translationParams.includes('(')) {
						console.warn(
							'WARNING: Translation params should not contain any function calls, ' +
								'since the regex replacement cannot deal with brackets inside the t() function. ' +
								'Store the translation params in a variable before calling the t() function.',
							{
								match,
								prefix,
								translation,
								translationParams,
								absoluteFilePath,
							}
						);
					}
					// If translation contains '___', use original translation, otherwise use translation found by the regexp
					newTranslations[formattedKey] =
						(formattedTranslation.includes('___')
							? (oldTranslations as { [key: string]: string })[formattedKey]
							: formattedTranslation) || '';
					return `${prefix}t('${formattedKey}'${translationParams})`;
				}
			);

			fs.writeFileSync(absoluteFilePath, content);
		} catch (err) {
			console.error(`Failed to find translations in file: ${relativeFilePath}`, err);
		}
	});
	return newTranslations;
}

async function getOnlineTranslations() {
	// Read file from poeditor website under /src/shared/translations/poeditor/project-id/nl.json
	const poEditorFiles = await getFilesByGlob('/src/shared/translations/poeditor/*/nl.json');
	const poEditorFile: string = poEditorFiles[0];
	if (!poEditorFile) {
		throw new Error(
			'File fetched from poEditor website could not be found: /src/shared/translations/poeditor/*/nl.json'
		);
	}
	try {
		return JSON.parse(fs.readFileSync(poEditorFile).toString());
	} catch (err) {
		throw new Error(`Failed to parse json file from poeditor: ${JSON.stringify(err, null, 2)}`);
	}
}

function checkTranslationsForKeysAsValue(translationJson: string) {
	// Identify  if any translations contain "___", then something went wrong with the translations
	const faultyTranslations = [];
	const faultyTranslationRegexp = /"(.*___.*)": ".*___/g;
	let matches: RegExpExecArray | null;
	do {
		matches = faultyTranslationRegexp.exec(translationJson);
		if (matches) {
			faultyTranslations.push(matches[1]);
		}
	} while (matches);

	if (faultyTranslations.length) {
		throw new Error(`Failed to extract translations, the following translations would be overridden by their key:
\t${faultyTranslations.join('\n\t')}`);
	}
}

async function updateTranslations() {
	const onlineTranslations = await getOnlineTranslations();

	// Extract translations from code and replace code by reference to translation key
	const codeFiles = await getFilesByGlob('**/*.@(ts|tsx)');
	const newTranslations: { [key: string]: string } = extractTranslationsFromCodeFiles(codeFiles);

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
	existingTranslationKeys.forEach((key: string) => {
		combinedTranslations[key] = onlineTranslations[key] || oldTranslations[key];
	});
	addedTranslationKeys.forEach((key: string) => {
		combinedTranslations[key] = onlineTranslations[key] || newTranslations[key];
	});

	const nlJsonContent = JSON.stringify(sortObject(combinedTranslations), null, 2);
	checkTranslationsForKeysAsValue(nlJsonContent); // Throws error if any key is found as a value

	fs.writeFileSync(
		`${__dirname.replace(/\\/g, '/')}/../src/shared/translations/nl.json`,
		nlJsonContent
	);

	const totalTranslations = existingTranslationKeys.length + addedTranslationKeys.length;
	console.log(
		`Wrote ${totalTranslations} src/shared/translations/nl.json file
\t${addedTranslationKeys.length} translations added
\t${removedTranslationKeys.length} translations deleted`
	);
}

updateTranslations().catch(err => console.error('Update of translations failed: ', err));
