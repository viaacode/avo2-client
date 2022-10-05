import { Avo } from '@viaa/avo2-types';
import { RelationEntry } from '@viaa/avo2-types/types/collection';
import { get } from 'lodash-es';

import {
	DeleteCollectionRelationsByObjectDocument,
	DeleteCollectionRelationsByObjectMutation,
	DeleteCollectionRelationsBySubjectDocument,
	DeleteCollectionRelationsBySubjectMutation,
	DeleteItemRelationsByObjectDocument,
	DeleteItemRelationsByObjectMutation,
	DeleteItemRelationsBySubjectDocument,
	DeleteItemRelationsBySubjectMutation,
	GetCollectionRelationsByObjectDocument,
	GetCollectionRelationsByObjectQuery,
	GetCollectionRelationsBySubjectDocument,
	GetCollectionRelationsBySubjectQuery,
	GetItemRelationsByObjectDocument,
	GetItemRelationsByObjectQuery,
	GetItemRelationsBySubjectDocument,
	GetItemRelationsBySubjectQuery,
	InsertCollectionRelationDocument,
	InsertCollectionRelationMutation,
	InsertItemRelationDocument,
	InsertItemRelationMutation,
	Lookup_Enum_Relation_Types_Enum,
} from '../../generated/graphql-db-types';
import { CustomError } from '../../helpers';
import { ApolloCacheManager, dataService } from '../data-service';

export class RelationService {
	public static async fetchRelationsByObject(
		type: 'collection' | 'item',
		relationType: Lookup_Enum_Relation_Types_Enum,
		objectIds: string[]
	): Promise<RelationEntry<Avo.Item.Item | Avo.Collection.Collection>[]> {
		return this.fetchRelations(type, null, relationType, objectIds);
	}

	public static async fetchRelationsBySubject(
		type: 'collection' | 'item',
		subjectIds: string[],
		relationType: Lookup_Enum_Relation_Types_Enum
	): Promise<RelationEntry<Avo.Item.Item | Avo.Collection.Collection>[]> {
		return this.fetchRelations(type, subjectIds, relationType, null);
	}

	private static async fetchRelations(
		type: 'collection' | 'item',
		subjectIds: string[] | null,
		relationType: Lookup_Enum_Relation_Types_Enum,
		objectIds: string[] | null
	): Promise<RelationEntry<Avo.Item.Item | Avo.Collection.Collection>[]> {
		let variables: any = undefined;
		const isCollection = type === 'collection';
		try {
			variables = {
				relationType,
				...(objectIds ? { objectIds } : {}),
				...(subjectIds ? { subjectIds } : {}),
			};
			const collectionQuery = objectIds
				? GetCollectionRelationsByObjectDocument
				: GetCollectionRelationsBySubjectDocument;
			const itemQuery = objectIds
				? GetItemRelationsByObjectDocument
				: GetItemRelationsBySubjectDocument;
			const response = await dataService.query<
				| GetCollectionRelationsByObjectQuery
				| GetCollectionRelationsBySubjectQuery
				| GetItemRelationsByObjectQuery
				| GetItemRelationsBySubjectQuery
			>({
				variables,
				query: isCollection ? collectionQuery : itemQuery,
			});
			return (
				get(
					response,
					isCollection ? 'data.app_collection_relations' : 'data.app_item_relations'
				) || []
			);
		} catch (err) {
			throw new CustomError('Failed to get relation from the database', err, {
				variables,
				query: isCollection
					? 'FETCH_COLLECTION_RELATIONS_BY_OBJECTS or FETCH_COLLECTION_RELATIONS_BY_SUBJECTS'
					: 'FETCH_ITEM_RELATIONS_BY_OBJECTS or FETCH_ITEM_RELATIONS_BY_SUBJECTS',
			});
		}
	}

	/**
	 * Inserts relationship between object and subject defined by the relationshipType
	 * @param type
	 * @param subjectId
	 * @param relationType
	 * @param objectId
	 */
	public static async insertRelation(
		type: 'collection' | 'item',
		subjectId: string,
		relationType: Lookup_Enum_Relation_Types_Enum,
		objectId: string
	): Promise<number> {
		let variables: any;
		const isCollection = type === 'collection';
		try {
			variables = {
				relationType,
				objectId,
				subjectId,
			};
			const response = await dataService.query<
				InsertCollectionRelationMutation | InsertItemRelationMutation
			>({
				variables,
				query: isCollection ? InsertCollectionRelationDocument : InsertItemRelationDocument,
				update: isCollection
					? ApolloCacheManager.clearCollectionCache
					: ApolloCacheManager.clearItemCache,
			});
			const relationId = get(
				response,
				`data.${
					isCollection ? 'insert_app_collection_relations' : 'insert_app_item_relations'
				}.returning[0].id`
			);
			if (!relationId) {
				throw new CustomError('Response does not contain a relation id', null, {
					response,
				});
			}
			return relationId;
		} catch (err) {
			throw new CustomError('Failed to insert relation into the database', err, {
				variables,
				query: isCollection ? 'INSERT_COLLECTION_RELATION' : 'INSERT_ITEM_RELATION',
			});
		}
	}

	public static async deleteRelationsByObject(
		type: 'collection' | 'item',
		relationType: Lookup_Enum_Relation_Types_Enum,
		objectId: string
	): Promise<void> {
		return RelationService.deleteRelations(type, null, relationType, objectId);
	}

	public static async deleteRelationsBySubject(
		type: 'collection' | 'item',
		subjectId: string,
		relationType: Lookup_Enum_Relation_Types_Enum
	): Promise<void> {
		return RelationService.deleteRelations(type, subjectId, relationType, null);
	}

	private static async deleteRelations(
		type: 'collection' | 'item',
		subjectId: string | null,
		relationType: Lookup_Enum_Relation_Types_Enum,
		objectId: string | null
	): Promise<void> {
		const isCollection = type === 'collection';
		let variables: any;
		try {
			variables = {
				relationType,
				...(objectId ? { objectId } : {}),
				...(subjectId ? { subjectId } : {}),
			};
			const collectionQuery = objectId
				? DeleteCollectionRelationsByObjectDocument
				: DeleteCollectionRelationsBySubjectDocument;
			const itemQuery = objectId
				? DeleteItemRelationsByObjectDocument
				: DeleteItemRelationsBySubjectDocument;
			await dataService.query<
				| DeleteCollectionRelationsByObjectMutation
				| DeleteCollectionRelationsBySubjectMutation
				| DeleteItemRelationsByObjectMutation
				| DeleteItemRelationsBySubjectMutation
			>({
				variables,
				query: isCollection ? collectionQuery : itemQuery,
				update: isCollection
					? ApolloCacheManager.clearCollectionCache
					: ApolloCacheManager.clearItemCache,
			});
		} catch (err) {
			throw new CustomError('Failed to delete relation from the database', err, {
				variables,
				query: isCollection ? 'DELETE_COLLECTION_RELATIONS' : 'DELETE_ITEM_RELATIONS',
			});
		}
	}
}
