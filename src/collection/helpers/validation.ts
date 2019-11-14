import { compact, isNil } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { stripHtml } from '../../shared/helpers';

import { MAX_SEARCH_DESCRIPTION_LENGTH } from '../collection.const';

type ValidationRule<T> = {
	error: string | ((object: T) => string);
	isValid: (object: T) => boolean;
};

const VALIDATION_RULES_FOR_SAVE: ValidationRule<Partial<Avo.Collection.Collection>>[] = [
	{
		error: 'De collectie beschrijving is te lang',
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!collection.description || collection.description.length <= MAX_SEARCH_DESCRIPTION_LENGTH,
	},
];

const VALIDATION_RULES_FOR_PUBLISH: ValidationRule<Partial<Avo.Collection.Collection>>[] = [
	{
		error: 'De collectie heeft geen titel.',
		isValid: (collection: Partial<Avo.Collection.Collection>) => !!collection.title,
	},
	{
		error: 'De collectie heeft geen beschrijving.',
		isValid: (collection: Partial<Avo.Collection.Collection>) => !!collection.description,
	},
	{
		error: "De collectie heeft geen onderwijsniveau's.",
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!!(collection.lom_context && collection.lom_context.length),
	},
	{
		error: 'De collectie heeft geen vakken.',
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!!(collection.lom_classification && collection.lom_classification.length),
	},
	{
		error: 'De collectie heeft geen items.',
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!!(collection.collection_fragments && collection.collection_fragments.length),
	},
	{
		error: 'De video-items moeten een titel en beschrijving bevatten.',
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!collection.collection_fragments ||
			validateFragments(collection.collection_fragments, 'video'),
	},
	{
		error: 'Uw tekst-items moeten een titel of beschrijving bevatten.',
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!collection.collection_fragments ||
			validateFragments(collection.collection_fragments, 'text'),
	},
	// TODO: Add check if owner or write-rights.
];

const VALIDATION_RULES_FOR_START_AND_END_TIMES_FRAGMENT: ValidationRule<
	Avo.Collection.Fragment
>[] = [
	{
		error: 'De starttijd heeft geen geldig formaat (uu:mm:ss)',
		isValid: (collectionFragment: Avo.Collection.Fragment) => {
			return !isNil(collectionFragment.start_oc);
		},
	},
	{
		error: 'De eindtijd heeft geen geldig formaat (uu:mm:ss)',
		isValid: (collectionFragment: Avo.Collection.Fragment) => {
			return !isNil(collectionFragment.end_oc);
		},
	},
	{
		error: 'De starttijd moet voor de eindtijd vallen',
		isValid: (collectionFragment: Avo.Collection.Fragment) => {
			return (
				!collectionFragment.start_oc ||
				!collectionFragment.end_oc ||
				collectionFragment.start_oc < collectionFragment.end_oc
			);
		},
	},
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

export const getValidationErrorsForStartAndEnd = (
	collectionFragment: Avo.Collection.Fragment
): string[] => {
	return compact(
		VALIDATION_RULES_FOR_START_AND_END_TIMES_FRAGMENT.map(rule =>
			rule.isValid(collectionFragment) ? null : getError(rule, collectionFragment)
		)
	);
};

export const getValidationErrorsForPublish = (
	collection: Partial<Avo.Collection.Collection>
): string[] => {
	return compact(
		[...VALIDATION_RULES_FOR_SAVE, ...VALIDATION_RULES_FOR_PUBLISH].map(rule =>
			rule.isValid(collection) ? null : getError(rule, collection)
		)
	);
};

export function getValidationErrorForSave(
	collection: Partial<Avo.Collection.Collection>
): string[] {
	// List of validator functions, so we can use the functions separately as well
	return compact(
		VALIDATION_RULES_FOR_SAVE.map(rule =>
			rule.isValid(collection) ? null : getError(rule, collection)
		)
	);
}

function getError<T>(rule: ValidationRule<T>, object: T) {
	if (typeof rule.error === 'string') {
		return rule.error;
	}
	return rule.error(object);
}
