import { type Avo } from '@viaa/avo2-types';

import {
	type GetCollectionMarcomEntriesQuery,
	type GetPublicCollectionsByIdQuery,
	type GetPublicCollectionsByTitleQuery,
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
	assignment = 5,
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

export enum CollectionOrBundle {
	COLLECTION = 'collection',
	BUNDLE = 'bundle',
}

/**
 * A collection in the database can represent a collection or a bundle
 * A collection fragment in the database can be of type: TEXT, ITEM, COLLECTION, ASSIGNMENT
 */
export enum CollectionFragmentType {
	TEXT = 'TEXT',
	ITEM = 'ITEM',
	COLLECTION = 'COLLECTION',
	ASSIGNMENT = 'ASSIGNMENT',
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

export const BLOCK_TYPE_TO_CONTENT_TYPE: Record<Avo.Core.BlockItemType, Avo.ContentType.English> = {
	TEXT: 'text',
	ITEM: 'item',
	COLLECTION: 'collection',
	ASSIGNMENT: 'assignment',
	ZOEK: 'search',
	BOUW: 'search',
};

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
	addAssignmentById = 'addAssignmentById',
	deleteCollection = 'deleteCollection',
	deleteContributor = 'deleteContributor',
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

export interface ParentBundle {
	id: string;
	title: string;
	is_public: boolean;
	author: string | null;
	organisation: string | null;
}
