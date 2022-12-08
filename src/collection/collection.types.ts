import type { Avo } from '@viaa/avo2-types';

import { BaseBlockWithMeta } from '../assignment/assignment.types';
import {
	GetCollectionMarcomEntriesQuery,
	GetPublicCollectionsByIdQuery,
	GetPublicCollectionsByTitleQuery,
} from '../shared/generated/graphql-db-types';

export type Collection = (
	| GetPublicCollectionsByIdQuery
	| GetPublicCollectionsByTitleQuery
)['app_collections'][0];

export enum ContentTypeNumber {
	audio = 1,
	video = 2,
	collection = 3,
	bundle = 4,
}

export enum ContentTypeString {
	item = 'item',
	audio = 'audio',
	video = 'video',
	collection = 'collectie',
	bundle = 'bundel',
	searchquery = 'zoekopdracht',
}

const CONTENT_TYPE_TRANSLATIONS: Record<Avo.ContentType.Dutch, Avo.ContentType.English> = {
	item: 'item',
	audio: 'audio',
	video: 'video',
	collectie: 'collection',
	map: 'bundle',
	bundel: 'bundle',
	zoek: 'search',
	zoekopdracht: 'searchquery',
};

export function blockTypeToContentType(
	type: Avo.Core.BlockItemBase['type']
): Avo.ContentType.English {
	let r: string = CONTENT_TYPE_TRANSLATIONS.item;

	switch (type) {
		case 'COLLECTION':
			r = CONTENT_TYPE_TRANSLATIONS.collectie;
			break;

		case 'ZOEK':
			r = CONTENT_TYPE_TRANSLATIONS.zoek;
			break;
	}

	return r as Avo.ContentType.English;
}

export function toEnglishContentType(label: Avo.ContentType.Dutch): Avo.ContentType.English {
	return CONTENT_TYPE_TRANSLATIONS[label];
}

export type CollectionLabelLookup = { [id: string]: string };

export interface QualityLabel {
	description: string;
	value: string;
}

export interface Relation {
	object_meta: {
		id: string;
		title: string;
	};
}

export type EditCollectionTab =
	| 'content'
	| 'metadata'
	| 'admin'
	| 'actualisation'
	| 'quality_check'
	| 'marcom';

export type MarcomEntry = GetCollectionMarcomEntriesQuery['app_collection_marcom_log'][0];

export interface BlockItemComponent {
	block?: BaseBlockWithMeta;
}
