import { type Avo } from '@viaa/avo2-types';

import {
	GetCollectionMarcomEntriesQuery,
	GetPublicCollectionsByIdQuery,
	GetPublicCollectionsByTitleQuery,
} from '../shared/generated/graphql-db-operations';

export type Collection = (
	| GetPublicCollectionsByIdQuery
	| GetPublicCollectionsByTitleQuery
)['app_collections_overview'][0];

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
	assignment = 'opdracht',
	searchquery = 'zoekopdracht',
}

export const CONTENT_TYPE_TRANSLATIONS: Record<Avo.ContentType.Dutch, Avo.ContentType.English> = {
	item: 'item',
	audio: 'audio',
	video: 'video',
	collectie: 'collection',
	map: 'bundle',
	bundel: 'bundle',
	zoek: 'search',
	zoekopdracht: 'searchquery',
	opdracht: 'assignment',
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

export type CollectionLabelLookup = { [id: string]: string };

export enum CollectionShareType {
	GEDEELD_MET_MIJ = 'GEDEELD_MET_MIJ',
	GEDEELD_MET_ANDERE = 'GEDEELD_MET_ANDERE',
	NIET_GEDEELD = 'NIET_GEDEELD',
}

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

export enum CollectionCreateUpdateTab {
	CONTENT = 'inhoud',
	PUBLISH = 'publicatiedetail',
	ADMIN = 'beheer',
	ACTUALISATION = 'actualisatie',
	QUALITY_CHECK = 'kwaliteitscontrole',
	MARCOM = 'communicatie',
}

export type MarcomEntry = GetCollectionMarcomEntriesQuery['app_collection_marcom_log'][0];

export interface BlockItemComponent {
	block?: Avo.Core.BlockItemBase;
}

export enum CollectionMenuAction {
	duplicate = 'duplicate',
	addToBundle = 'addToBundle',
	addItemById = 'addItemById',
	delete = 'delete',
	openShareThroughEmail = 'openShareThroughEmail',
	openPublishCollectionModal = 'openPublishCollectionModal',
	toggleBookmark = 'toggleBookmark',
	createAssignment = 'createAssignment',
	importToAssignment = 'importToAssignment',
	editCollection = 'editCollection',
	openQuickLane = 'openQuickLane',
	openAutoplayCollectionModal = 'openAutoplayCollectionModal',
	share = 'share',
	redirectToDetail = 'redirectToDetail',
	save = 'save',
	openPublishModal = 'openPublishModal',
	rename = 'rename',
}
