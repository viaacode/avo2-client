import { Avo } from '@viaa/avo2-types'

import {
  type GetPublicCollectionsByIdQuery,
  type GetPublicCollectionsByTitleQuery,
} from '../shared/generated/graphql-db-operations.js'

export type Collection = (
  | GetPublicCollectionsByIdQuery
  | GetPublicCollectionsByTitleQuery
)['app_collections_overview'][0]

export enum ContentTypeNumber {
  audio = 1,
  video = 2,
  collection = 3,
  bundle = 4,
  assignment = 5,
}

export enum CollectionOrBundle {
  COLLECTION = 'collection',
  BUNDLE = 'bundle',
}

export const COLLECTION_OR_BUNDLE_TO_CONTENT_TYPE_ENGLISH: Record<
  CollectionOrBundle,
  Avo.ContentType.English
> = {
  [CollectionOrBundle.COLLECTION]: Avo.ContentType.English.COLLECTION,
  [CollectionOrBundle.BUNDLE]: Avo.ContentType.English.BUNDLE,
}

export const CONTENT_TYPE_TRANSLATIONS_NL_TO_EN: Record<
  Avo.ContentType.Dutch,
  Avo.ContentType.English
> = {
  [Avo.ContentType.Dutch.ITEM]: Avo.ContentType.English.ITEM,
  [Avo.ContentType.Dutch.AUDIO]: Avo.ContentType.English.AUDIO,
  [Avo.ContentType.Dutch.VIDEO]: Avo.ContentType.English.VIDEO,
  [Avo.ContentType.Dutch.COLLECTIE]: Avo.ContentType.English.COLLECTION,
  [Avo.ContentType.Dutch.BUNDEL]: Avo.ContentType.English.BUNDLE,
  [Avo.ContentType.Dutch.ZOEK]: Avo.ContentType.English.SEARCH,
  [Avo.ContentType.Dutch.ZOEKOPDRACHT]: Avo.ContentType.English.SEARCHQUERY,
  [Avo.ContentType.Dutch.OPDRACHT]: Avo.ContentType.English.ASSIGNMENT,
  [Avo.ContentType.Dutch.CONTENTPAGINA]: Avo.ContentType.English.CONTENTPAGE,
}

export const BLOCK_TYPE_TO_CONTENT_TYPE: Record<
  Avo.Core.BlockItemType,
  Avo.ContentType.English
> = {
  [Avo.Core.BlockItemType.TEXT]: Avo.ContentType.English.TEXT,
  [Avo.Core.BlockItemType.ITEM]: Avo.ContentType.English.ITEM,
  [Avo.Core.BlockItemType.COLLECTION]: Avo.ContentType.English.COLLECTION,
  [Avo.Core.BlockItemType.ASSIGNMENT]: Avo.ContentType.English.ASSIGNMENT,
  [Avo.Core.BlockItemType.ZOEK]: Avo.ContentType.English.SEARCH,
  [Avo.Core.BlockItemType.BOUW]: Avo.ContentType.English.SEARCH,
}

export type CollectionLabelLookup = { [id: string]: string }

export enum CollectionShareType {
  GEDEELD_MET_MIJ = 'GEDEELD_MET_MIJ',
  GEDEELD_MET_ANDERE = 'GEDEELD_MET_ANDERE',
  NIET_GEDEELD = 'NIET_GEDEELD',
}

export interface QualityLabel {
  description: string
  value: string
}

export interface Relation {
  object_meta: {
    id: string
    title: string
  }
}

export enum CollectionCreateUpdateTab {
  CONTENT = 'inhoud',
  PUBLISH = 'publicatiedetail',
  ADMIN = 'beheer',
  ACTUALISATION = 'actualisatie',
  QUALITY_CHECK = 'kwaliteitscontrole',
  MARCOM = 'communicatie',
}

export interface MarcomEntryBase {
  channel_name?: string | null
  channel_type?: string | null
  external_link?: string | null
  publish_date?: string | null
  parent_collection?: { id: any; title: string } | null
}

export interface AssignmentMarcomEntry extends MarcomEntryBase {
  id?: string
  assignment_id: string
  parent_collection_id?: string
}

export interface CollectionMarcomEntry extends MarcomEntryBase {
  id?: number
  collection_id: string
}

export interface BlockItemComponent {
  block?: Avo.Core.BlockItemBase
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
  id: string
  title: string
  is_public: boolean
  author: string | null
  organisation: string | null
}
