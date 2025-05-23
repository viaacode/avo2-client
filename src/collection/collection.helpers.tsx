import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import {
	Column,
	Grid,
	MediaCard,
	MediaCardMetaData,
	MediaCardThumbnail,
	MetaData,
	MetaDataItem,
	Thumbnail,
} from '@viaa/avo2-components';
import { type Avo, LomSchemeType } from '@viaa/avo2-types';
import { compact, isNil, omit } from 'lodash-es';
import React, { type ReactNode } from 'react';

import { reorderBlockPositions } from '../assignment/assignment.helper';
import { stripHtml } from '../shared/helpers/formatters';
import { tHtml } from '../shared/helpers/translate-html';
import { tText } from '../shared/helpers/translate-text';
import { type Positioned } from '../shared/types';

import { MAX_LONG_DESCRIPTION_LENGTH, MAX_SEARCH_DESCRIPTION_LENGTH } from './collection.const';
import { CollectionService } from './collection.service';
import {
	CollectionFragmentType,
	CONTENT_TYPE_TRANSLATIONS,
	ContentTypeNumber,
} from './collection.types';

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
				? tText('collection/collection___de-collectie-beschrijving-is-te-lang')
				: tText('collection/collection___de-bundel-beschrijving-is-te-lang'),
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!collection.description ||
			collection.description.length <= MAX_SEARCH_DESCRIPTION_LENGTH,
	},
	{
		error: (collection) =>
			collection.type_id === ContentTypeNumber.collection
				? tText(
						'collection/collection___de-lange-beschrijving-van-deze-collectie-is-te-lang'
				  )
				: tText('collection/collection___de-lange-beschrijving-van-deze-bundel-is-te-lang'),
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!(collection as any).description_long ||
			stripHtml((collection as any).description_long).length <= MAX_LONG_DESCRIPTION_LENGTH,
	},
];

const GET_VALIDATION_RULES_FOR_PUBLISH = (): ValidationRule<
	Partial<Avo.Collection.Collection>
>[] => [
	{
		error: (collection) =>
			collection.type_id === ContentTypeNumber.collection
				? tText('collection/collection___de-collectie-heeft-geen-hoofdafbeelding')
				: tText('collection/collection___de-bundel-heeft-geen-hoofdafbeelding'),
		isValid: (collection: Partial<Avo.Collection.Collection>) => !!collection.thumbnail_path,
	},
	{
		error: (collection) =>
			collection.type_id === ContentTypeNumber.collection
				? tText('collection/collection___de-collectie-heeft-geen-titel')
				: tText('collection/collection___de-bundel-heeft-geen-titel'),
		isValid: (collection: Partial<Avo.Collection.Collection>) => !!collection.title,
	},
	{
		error: (collection) =>
			collection.type_id === ContentTypeNumber.collection
				? tText('collection/collection___de-collectie-heeft-geen-beschrijving')
				: tText('collection/collection___de-bundel-heeft-geen-beschrijving'),
		isValid: (collection: Partial<Avo.Collection.Collection>) => !!collection.description,
	},
	{
		error: (collection) =>
			collection.type_id === ContentTypeNumber.collection
				? tText('collection/collection___de-collectie-heeft-geen-onderwijsniveaus')
				: tText('collection/collection___de-bundel-heeft-geen-onderwijsniveaus'),
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!!collection.loms?.find((lom) => lom.lom?.scheme === LomSchemeType.structure),
	},
	{
		error: (collection) =>
			collection.type_id === ContentTypeNumber.collection
				? tText('collection/collection___de-collectie-heeft-geen-themas')
				: tText('collection/collection___de-bundel-heeft-geen-themas'),
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!!collection.loms?.find((lom) => lom.lom?.scheme === LomSchemeType.theme),
	},
	{
		error: (collection) =>
			collection.type_id === ContentTypeNumber.collection
				? tText('collection/collection___de-collectie-heeft-geen-vakken')
				: tText('collection/collection___de-bundel-heeft-geen-vakken'),
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!!collection.loms?.find((lom) => lom.lom?.scheme === LomSchemeType.subject),
	},
	{
		error: (collection) =>
			collection.type_id === ContentTypeNumber.collection
				? tText('collection/collection___de-collectie-heeft-geen-items')
				: tText('collection/collection___de-bundel-heeft-geen-collecties'),
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!!(collection.collection_fragments && collection.collection_fragments.length),
	},
	{
		error: (collection) =>
			collection.type_id === ContentTypeNumber.collection
				? tText(
						'collection/collection___de-video-items-moeten-een-titel-en-beschrijving-bevatten'
				  )
				: tText('collection/collection___de-collecties-moeten-een-titel-hebben'),
		isValid: (collection: Partial<Avo.Collection.Collection>) =>
			!collection.collection_fragments ||
			validateFragments(
				collection.collection_fragments,
				collection.type_id === ContentTypeNumber.collection
					? CollectionFragmentType.ITEM
					: CollectionFragmentType.COLLECTION
			),
	},
	{
		error: tText(
			'collection/collection___uw-tekst-items-moeten-een-titel-of-beschrijving-bevatten'
		),
		isValid: (collection: Partial<Avo.Collection.Collection>) => {
			return (
				collection.type_id === ContentTypeNumber.bundle ||
				!collection.collection_fragments ||
				validateFragments(collection.collection_fragments, CollectionFragmentType.TEXT)
			);
		},
	},
	{
		error: tText(
			'collection/collection___de-bundel-heeft-niet-publieke-collecties-of-opdrachten'
		),
		isValid: (bundle: Partial<Avo.Collection.Collection>) => {
			return (
				bundle.type_id === ContentTypeNumber.collection ||
				!bundle.collection_fragments ||
				bundle.collection_fragments.every((fragment) => {
					return (
						fragment.item_meta as Avo.Collection.Collection | Avo.Assignment.Assignment
					).is_public;
				})
			);
		},
	},
	// TODO: Add check if owner or write-rights.
];

const GET_VALIDATION_RULES_FOR_START_AND_END_TIMES_FRAGMENT: () => ValidationRule<
	Pick<Avo.Collection.Fragment, 'start_oc' | 'end_oc'>
>[] = () => [
	{
		error: tText('collection/collection___de-starttijd-heeft-geen-geldig-formaat-uu-mm-ss'),
		isValid: (collectionFragment) => {
			return !isNil(collectionFragment.start_oc);
		},
	},
	{
		error: tText('collection/collection___de-eindtijd-heeft-geen-geldig-formaat-uu-mm-ss'),
		isValid: (collectionFragment) => {
			return !isNil(collectionFragment.end_oc);
		},
	},
	{
		error: tText('collection/collection___de-starttijd-moet-voor-de-eindtijd-vallen'),
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
	type: CollectionFragmentType
): boolean => {
	if (!fragments || !fragments.length) {
		return false;
	}

	let isValid = true;

	switch (type) {
		case CollectionFragmentType.ITEM:
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

		case CollectionFragmentType.COLLECTION:
			// Check if video fragment has custom_title and custom_description if necessary.
			fragments.forEach((fragment) => {
				if (
					fragment.type === CollectionFragmentType.COLLECTION &&
					fragment.use_custom_fields &&
					!fragment.custom_title
				) {
					isValid = false;
				}
			});
			break;

		case CollectionFragmentType.TEXT:
			// Check if text fragment has custom_title or custom_description.
			fragments.forEach((fragment) => {
				if (
					fragment.type === CollectionFragmentType.TEXT &&
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

const getDuplicateTitleOrDescriptionErrors = async (
	collection: Partial<Avo.Collection.Collection>
): Promise<string[]> => {
	// Check if title and description isn't the same as an existing published collection
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
				? tText(
						'collection/components/modals/share-collection-modal___een-publieke-collectie-met-deze-titel-bestaat-reeds'
				  )
				: tText(
						'collection/components/modals/share-collection-modal___een-publieke-bundel-met-deze-titel-bestaat-reeds'
				  )
		);
	}

	if (duplicates.byDescription) {
		errors.push(
			collection.type_id === ContentTypeNumber.collection
				? tText(
						'collection/components/modals/share-collection-modal___een-publieke-collectie-met-deze-beschrijving-bestaat-reeds'
				  )
				: tText(
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
		...GET_VALIDATION_RULES_FOR_PUBLISH(),
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

/**
 * Gets the fragments from a collection or bundle
 * Optionally, you can filter by type
 * @param collection
 * @param type
 */
export const getFragmentsFromCollection = (
	collection: Partial<Avo.Collection.Collection> | null | undefined,
	type?: Avo.Core.BlockItemType
): Avo.Collection.Fragment[] => {
	const blocks = reorderBlockPositions(
		(collection?.collection_fragments || []) as Positioned[]
	) as Avo.Collection.Fragment[];
	if (type) {
		return blocks.filter((block) => block.type === type);
	}
	return blocks;
};

const COLLECTION_MANAGEMENT_PROPS: string[] = [
	'management',
	'management_actualised_at',
	'management_language_check',
	'management_quality_check',
	'management_final_check',
	'marcom_note',
	'QC',
];

/**
 * Clean the collection of properties from other tables, properties that can't be saved
 */
export const cleanCollectionBeforeSave = (
	collection: Partial<Avo.Collection.Collection>
): Partial<Avo.Collection.Collection> => {
	// Remove some props
	const propertiesToDelete = [
		'collection_fragments',
		'assignment_fragments',
		'__typename',
		'type',
		'profile',
		'updated_by',
		'collection_labels',
		'lom_typical_age_range',
		'lom_context',
		'lom_classification',
		'relations',
		'id',
		'loms',
		'contributors',
		...COLLECTION_MANAGEMENT_PROPS,
	];
	const cleanCollection = omit(collection, propertiesToDelete);

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
		'briefing_id',
		'collection_labels',
		'id',
		'note',
		'owner_profile_id',
		'profile',
		'relations',
		'type',
		'updated_by',
		'updated_by_profile_id',
		...COLLECTION_MANAGEMENT_PROPS,
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

const renderRelatedItem = (relatedItem: Avo.Search.ResultItem) => {
	const englishContentType =
		CONTENT_TYPE_TRANSLATIONS[relatedItem.administrative_type || 'video'];

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
				{tHtml('collection/views/collection-detail___bekijk-ook')}
			</BlockHeading>
			<Grid className="c-media-card-list">
				{renderRelatedContent(relatedItems, renderDetailLink)}
			</Grid>
		</>
	);
};
