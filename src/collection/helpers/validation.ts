import { compact } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { MAX_SEARCH_DESCRIPTION_LENGTH } from '../../constants';
import { stripHtml } from '../../shared/helpers/formatters/strip-html';

type ValidationRule = {
	error: string;
	isValid: (collection: Avo.Collection.Collection) => boolean;
};

const VALIDATION_RULES_FOR_SAVE: ValidationRule[] = [
	{
		error: 'De collectie beschrijving is te lang',
		isValid: (collection: Avo.Collection.Collection) =>
			!collection.description || collection.description.length < MAX_SEARCH_DESCRIPTION_LENGTH,
	},
];

const VALIDATION_RULES_FOR_PUBLISH: ValidationRule[] = [
	{
		error: 'De collectie heeft geen titel.',
		isValid: (collection: Avo.Collection.Collection) => !!collection.title,
	},
	{
		error: 'De collectie heeft geen beschrijving.',
		isValid: (collection: Avo.Collection.Collection) => !!collection.description,
	},
	{
		error: "De collectie heeft geen onderwijsniveau's.",
		isValid: (collection: Avo.Collection.Collection) =>
			!!(collection.lom_context && collection.lom_context.length),
	},
	{
		error: 'De collectie heeft geen vakken.',
		isValid: (collection: Avo.Collection.Collection) =>
			!!(collection.lom_classification && collection.lom_classification.length),
	},
	{
		error: 'De collectie heeft geen items.',
		isValid: (collection: Avo.Collection.Collection) =>
			!!(collection.collection_fragments && collection.collection_fragments.length),
	},
	{
		error: 'De video-items moeten een titel en beschrijving bevatten.',
		isValid: (collection: Avo.Collection.Collection) =>
			validateFragments(collection.collection_fragments, 'video'),
	},
	{
		error: 'Uw tekst-items moeten een titel of beschrijving bevatten.',
		isValid: (collection: Avo.Collection.Collection) =>
			validateFragments(collection.collection_fragments, 'text'),
	},
	// TODO: Add check if owner or write-rights.
];

const validateFragments = (fragments: Avo.Collection.Fragment[], type: string): boolean => {
	if (!fragments || !fragments.length) {
		return false;
	}

	let isValid = true;

	switch (type) {
		case 'video':
			// Check if video fragment has custom_title and custom_description if necessary.
			fragments.forEach(fragment => {
				if (
					fragment.external_id &&
					fragment.external_id !== '-1' &&
					fragment.use_custom_fields &&
					(!fragment.custom_title || !fragment.custom_description)
				) {
					isValid = false;
				}
			});
			break;
		case 'text':
			// Check if text fragment has custom_title or custom_description.
			fragments.forEach(fragment => {
				if (
					!fragment.external_id &&
					!stripHtml(fragment.custom_title || '').trim() &&
					!stripHtml(fragment.custom_description || '').trim()
				) {
					isValid = false;
				}
			});
			break;
		default:
			break;
	}

	return isValid;
};

export const getValidationErrorsForPublish = (collection: Avo.Collection.Collection): string[] => {
	return compact(
		[...VALIDATION_RULES_FOR_SAVE, ...VALIDATION_RULES_FOR_PUBLISH].map(rule =>
			!rule.isValid(collection) ? rule.error : null
		)
	);
};

export function getValidationErrorForSave(collection: Avo.Collection.Collection): string[] {
	// List of validator functions, so we can use the functions separately as well
	return compact(
		VALIDATION_RULES_FOR_SAVE.map(rule => (!rule.isValid(collection) ? rule.error : null))
	);
}
