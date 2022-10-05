import { DutchContentType, EnglishContentType } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { invert } from 'lodash-es';

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

const CONTENT_TYPE_TRANSLATIONS = {
	item: 'item',
	audio: 'audio',
	video: 'video',
	collectie: 'collection',
	map: 'bundle',
	bundel: 'bundle',
	zoek: 'search',
	zoekopdracht: 'searchquery',
};

export function toEnglishContentType(label: DutchContentType): EnglishContentType {
	return CONTENT_TYPE_TRANSLATIONS[label] as EnglishContentType;
}

export function toDutchContentType(label: EnglishContentType): DutchContentType {
	return invert(CONTENT_TYPE_TRANSLATIONS)[label] as DutchContentType;
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
	block?: Avo.Core.BlockItemBase;
}
