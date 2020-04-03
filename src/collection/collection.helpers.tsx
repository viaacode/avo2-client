import { compact, get, isNil, omit } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { stripHtml } from '../shared/helpers/formatters';
import i18n from '../shared/translations/i18n';

import { MAX_SEARCH_DESCRIPTION_LENGTH } from './collection.const';
import { ContentTypeNumber } from './collection.types';

export const isMediaFragment = (fragmentInfo: { external_id: string | undefined }) => {
	return fragmentInfo.external_id && fragmentInfo.external_id !== '-1';
};

export const getValidationFeedbackForShortDescription = (
	description: string | null,
	isError?: boolean | null
): string => {
	const count: string = `${(description || '').length}/${MAX_SEARCH_DESCRIPTION_LENGTH}`;

	const exceedsSize: boolean = (description || '').length > MAX_SEARCH_DESCRIPTION_LENGTH;

	if (isError) {
		return exceedsSize
			? i18n.t('collection/collection___de-korte-omschrijving-is-te-lang-count', {
					count,
			  } as any)
			: '';
	}

	return exceedsSize ? '' : `${(description || '').length}/${MAX_SEARCH_DESCRIPTION_LENGTH}`;
};

// Validation
type ValidationRule<T> = {
	error: string | ((object: T) => string);
	isValid: (object: T) => boolean;
};

const GET_VALIDATION_RULES_FOR_SAVE: () => ValidationRule<
	Partial<Avo.Collection.Collection>
>[] = () => [
	{
		error: collection =>
			collection.type_id === ContentTypeNumber.collection
				? i18n.t('collection/collection___de-collectie-beschrijving-is-te-lang')
				: i18n.t('collection/collection___de-bundel-beschrijving-is-te-lang'),
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!collection.description ||
			collection.description.length <= MAX_SEARCH_DESCRIPTION_LENGTH,
	},
];

const VALIDATION_RULES_FOR_PUBLISH: ValidationRule<Partial<Avo.Collection.Collection>>[] = [
	{
		error: collection =>
			collection.type_id === ContentTypeNumber.collection
				? i18n.t('collection/collection___de-collectie-heeft-geen-titel')
				: i18n.t('collection/collection___de-bundel-heeft-geen-titel'),
		isValid: (collection: Partial<Avo.Collection.Collection>) => !!collection.title,
	},
	{
		error: collection =>
			collection.type_id === ContentTypeNumber.collection
				? i18n.t('collection/collection___de-collectie-heeft-geen-beschrijving')
				: i18n.t('collection/collection___de-bundel-heeft-geen-beschrijving'),
		isValid: (collection: Partial<Avo.Collection.Collection>) => !!collection.description,
	},
	{
		error: collection =>
			collection.type_id === ContentTypeNumber.collection
				? i18n.t('collection/collection___de-collectie-heeft-geen-onderwijsniveaus')
				: i18n.t('collection/collection___de-bundel-heeft-geen-onderwijsniveaus'),
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!!(collection.lom_context && collection.lom_context.length),
	},
	{
		error: collection =>
			collection.type_id === ContentTypeNumber.collection
				? i18n.t('collection/collection___de-collectie-heeft-geen-vakken')
				: i18n.t('collection/collection___de-bundel-heeft-geen-vakken'),
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!!(collection.lom_classification && collection.lom_classification.length),
	},
	{
		error: collection =>
			collection.type_id === ContentTypeNumber.collection
				? i18n.t('collection/collection___de-collectie-heeft-geen-items')
				: i18n.t('collection/collection___de-bundel-heeft-geen-collecties'),
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!!(collection.collection_fragments && collection.collection_fragments.length),
	},
	{
		error: collection =>
			collection.type_id === ContentTypeNumber.collection
				? i18n.t(
						'collection/collection___de-video-items-moeten-een-titel-en-beschrijving-bevatten'
				  )
				: i18n.t('collection/collection___de-collecties-moeten-een-titel-hebben'),
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!collection.collection_fragments ||
			validateFragments(
				collection.collection_fragments,
				collection.type_id === ContentTypeNumber.collection ? 'video' : 'collection'
			),
	},
	{
		error: i18n.t(
			'collection/collection___uw-tekst-items-moeten-een-titel-of-beschrijving-bevatten'
		),
		isValid: (collection: Partial<Avo.Collection.Collection>) => {
			return (
				collection.type_id === ContentTypeNumber.bundle ||
				!collection.collection_fragments ||
				validateFragments(collection.collection_fragments, 'text')
			);
		},
	},
	// TODO: Add check if owner or write-rights.
];

const GET_VALIDATION_RULES_FOR_START_AND_END_TIMES_FRAGMENT: () => ValidationRule<
	Avo.Collection.Fragment
>[] = () => [
	{
		error: i18n.t('collection/collection___de-starttijd-heeft-geen-geldig-formaat-uu-mm-ss'),
		isValid: (collectionFragment: Avo.Collection.Fragment) => {
			return !isNil(collectionFragment.start_oc);
		},
	},
	{
		error: i18n.t('collection/collection___de-eindtijd-heeft-geen-geldig-formaat-uu-mm-ss'),
		isValid: (collectionFragment: Avo.Collection.Fragment) => {
			return !isNil(collectionFragment.end_oc);
		},
	},
	{
		error: i18n.t('collection/collection___de-starttijd-moet-voor-de-eindtijd-vallen'),
		isValid: (collectionFragment: Avo.Collection.Fragment) => {
			return (
				!collectionFragment.start_oc ||
				!collectionFragment.end_oc ||
				collectionFragment.start_oc < collectionFragment.end_oc
			);
		},
	},
];

const validateFragments = (
	fragments: Avo.Collection.Fragment[],
	type: 'text' | 'video' | 'collection'
): boolean => {
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

		case 'collection':
			// Check if video fragment has custom_title and custom_description if necessary.
			fragments.forEach(fragment => {
				if (
					fragment.external_id &&
					fragment.external_id !== '-1' &&
					fragment.use_custom_fields &&
					!fragment.custom_title
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
		GET_VALIDATION_RULES_FOR_START_AND_END_TIMES_FRAGMENT().map(rule =>
			rule.isValid(collectionFragment) ? null : getError(rule, collectionFragment)
		)
	);
};

export const getValidationErrorsForPublish = (
	collection: Partial<Avo.Collection.Collection>
): string[] => {
	return compact(
		[...GET_VALIDATION_RULES_FOR_SAVE(), ...VALIDATION_RULES_FOR_PUBLISH].map(rule => {
			return rule.isValid(collection) ? null : getError(rule, collection);
		})
	);
};

export const getValidationErrorForSave = (
	collection: Partial<Avo.Collection.Collection>
): string[] => {
	// List of validator functions, so we can use the functions separately as well
	return compact(
		GET_VALIDATION_RULES_FOR_SAVE().map(rule =>
			rule.isValid(collection) ? null : getError(rule, collection)
		)
	);
};

function getError<T>(rule: ValidationRule<T>, object: T) {
	if (typeof rule.error === 'string') {
		return rule.error;
	}
	return rule.error(object);
}

export const reorderFragments = (
	fragments: Avo.Collection.Fragment[]
): Avo.Collection.Fragment[] => {
	return fragments.map((fragment: Avo.Collection.Fragment, index: number) => ({
		...fragment,
		position: index + 1,
	}));
};

export const getFragmentsFromCollection = (
	collection: Partial<Avo.Collection.Collection> | null | undefined
): Avo.Collection.Fragment[] => {
	return get(collection, 'collection_fragments') || [];
};

/**
 * Clean the collection of properties from other tables, properties that can't be saved
 */
export const cleanCollectionBeforeSave = (
	collection: Partial<Avo.Collection.Collection>
): Partial<Avo.Collection.Collection> => {
	const propertiesToDelete = [
		'collection_fragments',
		'__typename',
		'type',
		'profile',
		'collection_labels',
	];

	return omit(collection, propertiesToDelete);
};

export const getFragmentIdsFromCollection = (
	collection: Partial<Avo.Collection.Collection> | null
): number[] => {
	return getFragmentsFromCollection(collection).map(
		(fragment: Avo.Collection.Fragment) => fragment.id
	);
};
