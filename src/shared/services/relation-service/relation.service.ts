import { get } from 'lodash-es';

import { CustomError } from '../../helpers';
import { ApolloCacheManager, dataService } from '../data-service';

import {
	DELETE_COLLECTION_RELATIONS_BY_OBJECT,
	DELETE_COLLECTION_RELATIONS_BY_SUBJECT,
	DELETE_ITEM_RELATIONS_BY_OBJECT,
	DELETE_ITEM_RELATIONS_BY_SUBJECT,
	FETCH_COLLECTION_RELATIONS_BY_OBJECT,
	FETCH_COLLECTION_RELATIONS_BY_SUBJECT,
	FETCH_ITEM_RELATIONS_BY_OBJECT,
	FETCH_ITEM_RELATIONS_BY_SUBJECT,
	INSERT_COLLECTION_RELATION,
	INSERT_ITEM_RELATION,
} from './relation.gql';
import { RelationEntry, RelationType } from './relation.types';

export class RelationService {
	public static async fetchRelationsByObject(
		type: 'collection' | 'item',
		objectId: string,
		relationType: RelationType
	): Promise<RelationEntry[]> {
		return this.fetchRelations(type, objectId, null, relationType);
	}

	public static async fetchRelationsBySubject(
		type: 'collection' | 'item',
		subjectId: string,
		relationType: RelationType
	): Promise<RelationEntry[]> {
		return this.fetchRelations(type, null, subjectId, relationType);
	}

	private static async fetchRelations(
		type: 'collection' | 'item',
		objectId: string | null,
		subjectId: string | null,
		relationType: RelationType
	): Promise<RelationEntry[]> {
		let variables: any;
		const isCollection = type === 'collection';
		try {
			variables = {
				relationType,
				...(objectId ? { objectId } : {}),
				...(subjectId ? { subjectId } : {}),
			};
			const collectionQuery = objectId
				? FETCH_COLLECTION_RELATIONS_BY_OBJECT
				: FETCH_COLLECTION_RELATIONS_BY_SUBJECT;
			const itemQuery = objectId
				? FETCH_ITEM_RELATIONS_BY_OBJECT
				: FETCH_ITEM_RELATIONS_BY_SUBJECT;
			const response = await dataService.mutate({
				variables,
				mutation: isCollection ? collectionQuery : itemQuery,
			});
			if (response.errors) {
				throw new CustomError('Failed due to graphql errors', null, { response });
			}
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
					? 'FETCH_COLLECTION_RELATIONS_BY_OBJECT'
					: 'FETCH_ITEM_RELATIONS_BY_OBJECT',
			});
		}
	}

	/**
	 * Inserts relationship between object and subject defined by the relationshipType
	 * @param type
	 * @param objectId
	 * @param subjectId
	 * @param relationType
	 */
	public static async insertRelation(
		type: 'collection' | 'item',
		objectId: string,
		subjectId: string,
		relationType: RelationType
	): Promise<number> {
		let variables: any;
		const isCollection = type === 'collection';
		try {
			variables = {
				relationType,
				objectId,
				subjectId,
			};
			const response = await dataService.mutate({
				variables,
				mutation: isCollection ? INSERT_COLLECTION_RELATION : INSERT_ITEM_RELATION,
				update: isCollection
					? ApolloCacheManager.clearCollectionCache
					: ApolloCacheManager.clearItemCache,
			});
			if (response.errors) {
				throw new CustomError('Failed due to graphql errors', null, { response });
			}
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
		objectId: string,
		relationType: RelationType
	): Promise<void> {
		return this.deleteRelations(type, objectId, null, relationType);
	}

	public static async deleteRelationsBySubject(
		type: 'collection' | 'item',
		subjectId: string,
		relationType: RelationType
	): Promise<void> {
		return this.deleteRelations(type, null, subjectId, relationType);
	}

	public static async deleteRelations(
		type: 'collection' | 'item',
		objectId: string | null,
		subjectId: string | null,
		relationType: RelationType
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
				? DELETE_COLLECTION_RELATIONS_BY_OBJECT
				: DELETE_COLLECTION_RELATIONS_BY_SUBJECT;
			const itemQuery = objectId
				? DELETE_ITEM_RELATIONS_BY_OBJECT
				: DELETE_ITEM_RELATIONS_BY_SUBJECT;
			const response = await dataService.mutate({
				variables,
				mutation: isCollection ? collectionQuery : itemQuery,
				update: isCollection
					? ApolloCacheManager.clearCollectionCache
					: ApolloCacheManager.clearItemCache,
			});
			if (response.errors) {
				throw new CustomError('Failed due to graphql errors', null, { response });
			}
		} catch (err) {
			throw new CustomError('Failed to delete relation from the database', err, {
				variables,
				query: isCollection ? 'DELETE_COLLECTION_RELATIONS' : 'DELETE_ITEM_RELATIONS',
			});
		}
	}
}
