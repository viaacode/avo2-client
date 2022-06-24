import { invert } from 'lodash-es';

import { DutchContentType, EnglishContentType } from '@viaa/avo2-components';
import { CollectionFragment } from '@viaa/avo2-types/types/collection';

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

export interface MarcomEntry {
	id: string;
	channel_name: string | null;
	channel_type: string | null;
	external_link: string | null;
	publish_date: string;
	collection_id: string;
	parent_collection: { title: string } | null;
}

export interface FragmentComponent {
	fragment: CollectionFragment;
}
