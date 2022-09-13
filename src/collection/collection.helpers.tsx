import {
	BlockHeading,
	Column,
	EnglishContentType,
	Grid,
	MediaCard,
	MediaCardMetaData,
	MediaCardThumbnail,
	MetaData,
	MetaDataItem,
	Spacer,
	Thumbnail,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { compact, get, isNil, omit, sortBy } from 'lodash-es';
import React, { ReactNode } from 'react';
import { Trans } from 'react-i18next';

import { SearchFilter } from '../search/search.const';
import { FilterState } from '../search/search.types';
import { formatDate, renderSearchLinks, stripHtml } from '../shared/helpers';
import i18n from '../shared/translations/i18n';

import {
	CollectionBlockType,
	MAX_LONG_DESCRIPTION_LENGTH,
	MAX_SEARCH_DESCRIPTION_LENGTH,
} from './collection.const';
import { CollectionService } from './collection.service';
import { ContentTypeNumber, ContentTypeString, toEnglishContentType } from './collection.types';

export const getValidationFeedbackForDescription = (
	description: string | null,
	maxLength: number,
	getTooLongErrorMessage: (count: string) => string,
	isError?: boolean | null
): string => {
	const count = `${(description || '').length}/${maxLength}`;

	const exceedsSize: boolean = (description || '').length > maxLength;

	if (isError) {
		return exceedsSize ? getTooLongErrorMessage(count) : '';
	}

	return exceedsSize ? '' : `${(description || '').length}/${maxLength}`;
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
		error: (collection) =>
			collection.type_id === ContentTypeNumber.collection
				? i18n.t('collection/collection___de-collectie-beschrijving-is-te-lang')
				: i18n.t('collection/collection___de-bundel-beschrijving-is-te-lang'),
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!collection.description ||
			collection.description.length <= MAX_SEARCH_DESCRIPTION_LENGTH,
	},
	{
		error: (collection) =>
			collection.type_id === ContentTypeNumber.collection
				? i18n.t(
						'collection/collection___de-lange-beschrijving-van-deze-collectie-is-te-lang'
				  )
				: i18n.t(
						'collection/collection___de-lange-beschrijving-van-deze-bundel-is-te-lang'
				  ),
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!(collection as any).description_long ||
			(collection as any).description_long.length <= MAX_LONG_DESCRIPTION_LENGTH,
	},
];

const VALIDATION_RULES_FOR_PUBLISH: ValidationRule<Partial<Avo.Collection.Collection>>[] = [
	{
		error: (collection) =>
			collection.type_id === ContentTypeNumber.collection
				? i18n.t('collection/collection___de-collectie-heeft-geen-titel')
				: i18n.t('collection/collection___de-bundel-heeft-geen-titel'),
		isValid: (collection: Partial<Avo.Collection.Collection>) => !!collection.title,
	},
	{
		error: (collection) =>
			collection.type_id === ContentTypeNumber.collection
				? i18n.t('collection/collection___de-collectie-heeft-geen-beschrijving')
				: i18n.t('collection/collection___de-bundel-heeft-geen-beschrijving'),
		isValid: (collection: Partial<Avo.Collection.Collection>) => !!collection.description,
	},
	{
		error: (collection) =>
			collection.type_id === ContentTypeNumber.collection
				? i18n.t('collection/collection___de-collectie-heeft-geen-onderwijsniveaus')
				: i18n.t('collection/collection___de-bundel-heeft-geen-onderwijsniveaus'),
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!!(collection.lom_context && collection.lom_context.length),
	},
	{
		error: (collection) =>
			collection.type_id === ContentTypeNumber.collection
				? i18n.t('collection/collection___de-collectie-heeft-geen-vakken')
				: i18n.t('collection/collection___de-bundel-heeft-geen-vakken'),
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!!(collection.lom_classification && collection.lom_classification.length),
	},
	{
		error: (collection) =>
			collection.type_id === ContentTypeNumber.collection
				? i18n.t('collection/collection___de-collectie-heeft-geen-items')
				: i18n.t('collection/collection___de-bundel-heeft-geen-collecties'),
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!!(collection.collection_fragments && collection.collection_fragments.length),
	},
	{
		error: (collection) =>
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
	Pick<Avo.Collection.Fragment, 'start_oc' | 'end_oc'>
>[] = () => [
	{
		error: i18n.t('collection/collection___de-starttijd-heeft-geen-geldig-formaat-uu-mm-ss'),
		isValid: (collectionFragment) => {
			return !isNil(collectionFragment.start_oc);
		},
	},
	{
		error: i18n.t('collection/collection___de-eindtijd-heeft-geen-geldig-formaat-uu-mm-ss'),
		isValid: (collectionFragment) => {
			return !isNil(collectionFragment.end_oc);
		},
	},
	{
		error: i18n.t('collection/collection___de-starttijd-moet-voor-de-eindtijd-vallen'),
		isValid: (collectionFragment) => {
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
			fragments.forEach((fragment) => {
				if (
					fragment.type === 'ITEM' &&
					fragment.use_custom_fields &&
					(!fragment.custom_title || !fragment.custom_description)
				) {
					isValid = false;
				}
			});
			break;

		case 'collection':
			// Check if video fragment has custom_title and custom_description if necessary.
			fragments.forEach((fragment) => {
				if (
					fragment.type === 'COLLECTION' &&
					fragment.use_custom_fields &&
					!fragment.custom_title
				) {
					isValid = false;
				}
			});
			break;

		case 'text':
			// Check if text fragment has custom_title or custom_description.
			fragments.forEach((fragment) => {
				if (
					fragment.type === CollectionBlockType.TEXT &&
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
	collectionFragment: Pick<Avo.Collection.Fragment, 'start_oc' | 'end_oc'>
): string[] => {
	return compact(
		GET_VALIDATION_RULES_FOR_START_AND_END_TIMES_FRAGMENT().map((rule) =>
			rule.isValid(collectionFragment) ? null : getError(rule, collectionFragment)
		)
	);
};

export const getDuplicateTitleOrDescriptionErrors = async (
	collection: Partial<Avo.Collection.Collection>
): Promise<string[]> => {
	// Check if title and description is,'t the same as an existing published collection
	const duplicates = await CollectionService.getCollectionByTitleOrDescription(
		collection.title || '',
		collection.description || '',
		collection.id as string,
		collection.type_id as ContentTypeNumber
	);

	const errors = [];

	if (duplicates.byTitle) {
		errors.push(
			collection.type_id === ContentTypeNumber.collection
				? i18n.t(
						'collection/components/modals/share-collection-modal___een-publieke-collectie-met-deze-titel-bestaat-reeds'
				  )
				: i18n.t(
						'collection/components/modals/share-collection-modal___een-publieke-bundel-met-deze-titel-bestaat-reeds'
				  )
		);
	}

	if (duplicates.byDescription) {
		errors.push(
			collection.type_id === ContentTypeNumber.collection
				? i18n.t(
						'collection/components/modals/share-collection-modal___een-publieke-collectie-met-deze-beschrijving-bestaat-reeds'
				  )
				: i18n.t(
						'collection/components/modals/share-collection-modal___een-publieke-bundel-met-deze-beschrijving-bestaat-reeds'
				  )
		);
	}
	return errors;
};

export const getValidationErrorsForPublish = async (
	collection: Partial<Avo.Collection.Collection>
): Promise<string[]> => {
	const validationErrors = [
		...GET_VALIDATION_RULES_FOR_SAVE(),
		...VALIDATION_RULES_FOR_PUBLISH,
	].map((rule) => {
		return rule.isValid(collection) ? null : getError(rule, collection);
	});
	const duplicateErrors = await getDuplicateTitleOrDescriptionErrors(collection);
	return compact([...validationErrors, ...duplicateErrors]);
};

export const getValidationErrorForSave = async (
	collection: Partial<Avo.Collection.Collection>
): Promise<string[]> => {
	// List of validator functions, so we can use the functions separately as well
	const validationErrors = GET_VALIDATION_RULES_FOR_SAVE().map((rule) =>
		rule.isValid(collection) ? null : getError(rule, collection)
	);

	const duplicateErrors = collection.is_public
		? await getDuplicateTitleOrDescriptionErrors(collection)
		: [];
	return compact([...validationErrors, ...duplicateErrors]);
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
	return sortBy(get(collection, 'collection_fragments') || [], ['position']);
};

/**
 * Clean the collection of properties from other tables, properties that can't be saved
 */
export const cleanCollectionBeforeSave = (
	collection: Partial<Avo.Collection.Collection>
): Partial<Avo.Collection.Collection> => {
	// Remove some props
	const propertiesToDelete = [
		'collection_fragments',
		'__typename',
		'type',
		'profile',
		'updated_by',
		'collection_labels',
		'relations',
		'id',
		'management',
		'QC',
		'management_language_check',
		'management_quality_check',
		'management_approved_at',
		'management_actualised_at',
		'marcom_note',
	];
	const cleanCollection = omit(collection, propertiesToDelete);

	// Rename lom_typical_age_range to lom_typicalagerange since graphql has a different naming from elasticsearch
	(cleanCollection as any).lom_typicalagerange = cleanCollection.lom_typical_age_range;
	delete cleanCollection.lom_typical_age_range;

	return cleanCollection;
};

/**
 * Clean the collection of properties before comparing if the collection core values have been changes
 * Used to determine if update_at should be updated.
 * This should only happen for core collection values and not for management changes
 */
export const keepCoreCollectionProperties = (
	collection: Partial<Avo.Collection.Collection> | null
): Partial<Avo.Collection.Collection> | null => {
	if (!collection) {
		return collection;
	}
	const propertiesToDelete = [
		'__typename',
		'type',
		'profile',
		'updated_by',
		'collection_labels',
		'relations',
		'id',
		'is_managed',
		'management',
		'QC',
		'management_language_check',
		'management_quality_check',
		'management_approved_at',
		'management_actualised_at',
	];

	return omit(collection, propertiesToDelete);
};

export const getFragmentIdsFromCollection = (
	collection: Partial<Avo.Collection.Collection> | null
): (number | string)[] => {
	return compact(
		getFragmentsFromCollection(collection).map(
			(fragment: Avo.Collection.Fragment) => fragment.id
		)
	);
};

export const renderSubjects = (
	id: string,
	lom_classification: string[] | null,
	enabledMetaData: SearchFilter[],
	renderSearchLink: (
		linkText: string | ReactNode,
		newFilters: FilterState,
		className?: string
	) => ReactNode
): ReactNode | null => {
	if (!enabledMetaData.includes(SearchFilter.subject)) {
		return null;
	}
	return (
		<Spacer margin="top-large">
			<p className="u-text-bold">{i18n.t('collection/views/collection-detail___vakken')}</p>
			<p className="c-body-1">
				{lom_classification?.length ? (
					renderSearchLinks(
						renderSearchLink,
						id,
						SearchFilter.subject,
						lom_classification
					)
				) : (
					<span className="u-d-block">-</span>
				)}
			</p>
		</Spacer>
	);
};

export const renderEducationLevels = (
	id: string,
	lom_context: string[] | null,
	enabledMetaData: SearchFilter[],
	renderSearchLink: (
		linkText: string | ReactNode,
		newFilters: FilterState,
		className?: string
	) => ReactNode
): ReactNode | null => {
	if (!enabledMetaData.includes(SearchFilter.educationLevel)) {
		return null;
	}
	return (
		<Spacer margin="top-large">
			<p className="u-text-bold">
				{i18n.t('collection/views/collection-detail___onderwijsniveau')}
			</p>
			<p className="c-body-1">
				{lom_context && lom_context.length ? (
					renderSearchLinks(
						renderSearchLink,
						id,
						SearchFilter.educationLevel,
						lom_context
					)
				) : (
					<span className="u-d-block">-</span>
				)}
			</p>
		</Spacer>
	);
};

export const renderCommonMetadata = (
	collectionOrBundle: Avo.Collection.Collection,
	enabledMetaData: SearchFilter[],
	renderSearchLink: (
		linkText: string | ReactNode,
		newFilters: FilterState,
		className?: string
	) => ReactNode
): ReactNode => {
	const { id, lom_context, lom_classification, created_at, updated_at } = collectionOrBundle;
	return (
		<>
			{(!!renderEducationLevels(id, lom_context, enabledMetaData, renderSearchLink) ||
				!!renderSubjects(id, lom_classification, enabledMetaData, renderSearchLink)) && (
				<Column size="3-3">
					{renderEducationLevels(id, lom_context, enabledMetaData, renderSearchLink)}
					{renderSubjects(id, lom_classification, enabledMetaData, renderSearchLink)}
				</Column>
			)}
			<Column size="3-3">
				<Spacer margin="top-large">
					<p className="u-text-bold">
						{i18n.t('collection/views/collection-detail___aangemaakt-op')}
					</p>
					<p className="c-body-1">{formatDate(created_at)}</p>
				</Spacer>
			</Column>
			<Column size="3-3">
				<Spacer margin="top-large">
					<p className="u-text-bold">
						{i18n.t('collection/views/collection-detail___laatst-aangepast')}
					</p>
					<p className="c-body-1">{formatDate(updated_at)}</p>
				</Spacer>
			</Column>
		</>
	);
};

const renderRelatedItem = (relatedItem: Avo.Search.ResultItem) => {
	const englishContentType: EnglishContentType =
		toEnglishContentType(relatedItem.administrative_type) || ContentTypeString.video;

	return (
		<MediaCard
			category={englishContentType}
			orientation="horizontal"
			title={relatedItem.dc_title}
		>
			<MediaCardThumbnail>
				<Thumbnail
					category={englishContentType}
					src={relatedItem.thumbnail_path}
					showCategoryIcon
				/>
			</MediaCardThumbnail>
			<MediaCardMetaData>
				<MetaData category={englishContentType}>
					<MetaDataItem label={relatedItem.original_cp || ''} />
				</MetaData>
			</MediaCardMetaData>
		</MediaCard>
	);
};

const renderRelatedContent = (
	relatedItems: Avo.Search.ResultItem[],
	renderDetailLink: (
		linkText: string | ReactNode,
		id: string,
		type: Avo.Core.ContentType,
		className?: string
	) => ReactNode
) => {
	return (relatedItems || []).map((relatedItem: Avo.Search.ResultItem) => {
		return (
			<Column size="2-6" key={`related-item-${relatedItem.id}`}>
				{renderDetailLink(
					renderRelatedItem(relatedItem),
					relatedItem.id,
					relatedItem.administrative_type,
					'a-link__no-styles'
				)}
			</Column>
		);
	});
};

export const renderRelatedItems = (
	relatedItems: Avo.Search.ResultItem[] | null,
	renderDetailLink: (
		linkText: string | ReactNode,
		id: string,
		type: Avo.Core.ContentType,
		className?: string
	) => ReactNode
): ReactNode | null => {
	if (!relatedItems?.length) {
		return null;
	}
	return (
		<>
			<hr className="c-hr" />
			<BlockHeading type="h3">
				<Trans i18nKey="collection/views/collection-detail___bekijk-ook">Bekijk ook</Trans>
			</BlockHeading>
			<Grid className="c-media-card-list">
				{renderRelatedContent(relatedItems, renderDetailLink)}
			</Grid>
		</>
	);
};
