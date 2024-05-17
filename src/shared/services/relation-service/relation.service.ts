import { type Avo } from '@viaa/avo2-types';

import {
	type DeleteAssignmentRelationsByObjectMutation,
	type DeleteAssignmentRelationsByObjectMutationVariables,
	type DeleteAssignmentRelationsBySubjectMutation,
	type DeleteAssignmentRelationsBySubjectMutationVariables,
	type DeleteCollectionRelationsByObjectMutation,
	type DeleteCollectionRelationsByObjectMutationVariables,
	type DeleteCollectionRelationsBySubjectMutation,
	type DeleteCollectionRelationsBySubjectMutationVariables,
	type DeleteItemRelationsByObjectMutation,
	type DeleteItemRelationsByObjectMutationVariables,
	type DeleteItemRelationsBySubjectMutation,
	type DeleteItemRelationsBySubjectMutationVariables,
	type GetAssignmentRelationsByObjectQuery,
	type GetAssignmentRelationsByObjectQueryVariables,
	type GetAssignmentRelationsBySubjectQuery,
	type GetAssignmentRelationsBySubjectQueryVariables,
	type GetCollectionRelationsByObjectQuery,
	type GetCollectionRelationsByObjectQueryVariables,
	type GetCollectionRelationsBySubjectQuery,
	type GetCollectionRelationsBySubjectQueryVariables,
	type GetItemRelationsByObjectQuery,
	type GetItemRelationsByObjectQueryVariables,
	type GetItemRelationsBySubjectQuery,
	type GetItemRelationsBySubjectQueryVariables,
	type InsertAssignmentRelationMutation,
	type InsertAssignmentRelationMutationVariables,
	type InsertCollectionRelationMutation,
	type InsertCollectionRelationMutationVariables,
	type InsertItemRelationMutation,
	type InsertItemRelationMutationVariables,
} from '../../generated/graphql-db-operations';
import {
	DeleteAssignmentRelationsByObjectDocument,
	DeleteAssignmentRelationsBySubjectDocument,
	DeleteCollectionRelationsByObjectDocument,
	DeleteCollectionRelationsBySubjectDocument,
	DeleteItemRelationsByObjectDocument,
	DeleteItemRelationsBySubjectDocument,
	GetAssignmentRelationsByObjectDocument,
	GetAssignmentRelationsBySubjectDocument,
	GetCollectionRelationsByObjectDocument,
	GetCollectionRelationsBySubjectDocument,
	GetItemRelationsByObjectDocument,
	GetItemRelationsBySubjectDocument,
	InsertAssignmentRelationDocument,
	InsertCollectionRelationDocument,
	InsertItemRelationDocument,
} from '../../generated/graphql-db-react-query';
import { type Lookup_Enum_Relation_Types_Enum } from '../../generated/graphql-db-types';
import { CustomError } from '../../helpers';
import { dataService } from '../data-service';

export class RelationService {
	public static async fetchRelationsByObject(
		type: 'collection' | 'assignment' | 'item',
		relationType: Lookup_Enum_Relation_Types_Enum,
		objectIds: string[]
	): Promise<
		| Avo.Collection.RelationEntry<
				Avo.Item.Item | Avo.Collection.Collection | Avo.Assignment.Assignment
		  >[]
		| Avo.Assignment.RelationEntry<Avo.Assignment.Assignment>[]
	> {
		return this.fetchRelations(type, null, relationType, objectIds);
	}

	public static async fetchRelationsBySubject(
		type: 'collection' | 'assignment' | 'item',
		subjectIds: string[],
		relationType: Lookup_Enum_Relation_Types_Enum
	): Promise<
		| Avo.Collection.RelationEntry<
				Avo.Item.Item | Avo.Collection.Collection | Avo.Assignment.Assignment
		  >[]
		| Avo.Assignment.RelationEntry<Avo.Assignment.Assignment>[]
	> {
		return this.fetchRelations(type, subjectIds, relationType, null);
	}

	private static async fetchRelations(
		type: 'collection' | 'assignment' | 'item',
		subjectIds: string[] | null,
		relationType: Lookup_Enum_Relation_Types_Enum,
		objectIds: string[] | null
	): Promise<
		| Avo.Collection.RelationEntry<
				Avo.Item.Item | Avo.Collection.Collection | Avo.Assignment.Assignment
		  >[]
		| Avo.Assignment.RelationEntry<Avo.Assignment.Assignment>[]
	> {
		let variables: any = undefined;
		const isCollection = type === 'collection';
		const isAssignment = type === 'assignment';
		try {
			variables = {
				relationType,
				...(objectIds ? { objectIds } : {}),
				...(subjectIds ? { subjectIds } : {}),
			};
			const collectionQuery = objectIds
				? GetCollectionRelationsByObjectDocument
				: GetCollectionRelationsBySubjectDocument;
			const assignmentQuery = objectIds
				? GetAssignmentRelationsByObjectDocument
				: GetAssignmentRelationsBySubjectDocument;
			const itemQuery = objectIds
				? GetItemRelationsByObjectDocument
				: GetItemRelationsBySubjectDocument;
			const response = await dataService.query<
				| GetCollectionRelationsByObjectQuery
				| GetCollectionRelationsBySubjectQuery
				| GetAssignmentRelationsByObjectQuery
				| GetAssignmentRelationsBySubjectQuery
				| GetItemRelationsByObjectQuery
				| GetItemRelationsBySubjectQuery,
				| GetCollectionRelationsByObjectQueryVariables
				| GetCollectionRelationsBySubjectQueryVariables
				| GetAssignmentRelationsByObjectQueryVariables
				| GetAssignmentRelationsBySubjectQueryVariables
				| GetItemRelationsByObjectQueryVariables
				| GetItemRelationsBySubjectQueryVariables
			>({
				variables,
				query: isCollection ? collectionQuery : isAssignment ? assignmentQuery : itemQuery,
			});
			if (isCollection) {
				return ((
					response as
						| GetCollectionRelationsByObjectQuery
						| GetCollectionRelationsBySubjectQuery
				).app_collection_relations ||
					[]) as Avo.Collection.RelationEntry<Avo.Collection.Collection>[];
			} else if (isAssignment) {
				return ((
					response as
						| GetAssignmentRelationsByObjectQuery
						| GetAssignmentRelationsBySubjectQuery
				).app_assignments_v2_relations ||
					[]) as Avo.Assignment.RelationEntry<Avo.Assignment.Assignment>[];
			} else {
				return ((response as GetItemRelationsByObjectQuery | GetItemRelationsBySubjectQuery)
					.app_item_relations || []) as Avo.Collection.RelationEntry<Avo.Item.Item>[];
			}
		} catch (err) {
			throw new CustomError('Failed to get relation from the database', err, {
				variables,
				query: isCollection
					? 'FETCH_COLLECTION_RELATIONS_BY_OBJECTS or FETCH_COLLECTION_RELATIONS_BY_SUBJECTS'
					: isAssignment
					? 'FETCH_ASSIGNMENT_RELATIONS_BY_OBJECTS or FETCH_ASSIGNMENT_RELATIONS_BY_SUBJECTS'
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
		type: 'collection' | 'assignment' | 'item',
		subjectId: string,
		relationType: Lookup_Enum_Relation_Types_Enum,
		objectId: string
	): Promise<number> {
		let variables: any;
		const isCollection = type === 'collection';
		const isAssignment = type === 'assignment';
		try {
			variables = {
				relationType,
				objectId,
				subjectId,
			};
			const response = await dataService.query<
				| InsertCollectionRelationMutation
				| InsertAssignmentRelationMutation
				| InsertItemRelationMutation,
				| InsertCollectionRelationMutationVariables
				| InsertAssignmentRelationMutationVariables
				| InsertItemRelationMutationVariables
			>({
				variables,
				query: isCollection
					? InsertCollectionRelationDocument
					: isAssignment
					? InsertAssignmentRelationDocument
					: InsertItemRelationDocument,
			});
			let relationId;
			if (isCollection) {
				relationId = (response as InsertCollectionRelationMutation)
					.insert_app_collection_relations?.returning?.[0]?.id;
			} else if (isAssignment) {
				relationId = (response as InsertAssignmentRelationMutation)
					.insert_app_assignments_v2_relations?.returning?.[0]?.id;
			} else {
				relationId = (response as InsertItemRelationMutation).insert_app_item_relations
					?.returning?.[0]?.id;
			}
			if (!relationId) {
				throw new CustomError('Response does not contain a relation id', null, {
					response,
				});
			}
			return relationId;
		} catch (err) {
			throw new CustomError('Failed to insert relation into the database', err, {
				variables,
				query: isCollection
					? 'INSERT_COLLECTION_RELATION'
					: isAssignment
					? 'INSERT_ASSIGNMENT_RELATION'
					: 'INSERT_ITEM_RELATION',
			});
		}
	}

	public static async deleteRelationsByObject(
		type: 'collection' | 'assignment' | 'item',
		relationType: Lookup_Enum_Relation_Types_Enum,
		objectId: string
	): Promise<void> {
		return RelationService.deleteRelations(type, null, relationType, objectId);
	}

	public static async deleteRelationsBySubject(
		type: 'collection' | 'assignment' | 'item',
		subjectId: string,
		relationType: Lookup_Enum_Relation_Types_Enum
	): Promise<void> {
		return RelationService.deleteRelations(type, subjectId, relationType, null);
	}

	private static async deleteRelations(
		type: 'collection' | 'assignment' | 'item',
		subjectId: string | null,
		relationType: Lookup_Enum_Relation_Types_Enum,
		objectId: string | null
	): Promise<void> {
		const isCollection = type === 'collection';
		const isAssignment = type === 'assignment';
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
			const assignmentQuery = objectId
				? DeleteAssignmentRelationsByObjectDocument
				: DeleteAssignmentRelationsBySubjectDocument;
			const itemQuery = objectId
				? DeleteItemRelationsByObjectDocument
				: DeleteItemRelationsBySubjectDocument;
			await dataService.query<
				| DeleteCollectionRelationsByObjectMutation
				| DeleteCollectionRelationsBySubjectMutation
				| DeleteAssignmentRelationsByObjectMutation
				| DeleteAssignmentRelationsBySubjectMutation
				| DeleteItemRelationsByObjectMutation
				| DeleteItemRelationsBySubjectMutation,
				| DeleteCollectionRelationsByObjectMutationVariables
				| DeleteCollectionRelationsBySubjectMutationVariables
				| DeleteAssignmentRelationsByObjectMutationVariables
				| DeleteAssignmentRelationsBySubjectMutationVariables
				| DeleteItemRelationsByObjectMutationVariables
				| DeleteItemRelationsBySubjectMutationVariables
			>({
				variables,
				query: isCollection ? collectionQuery : isAssignment ? assignmentQuery : itemQuery,
			});
		} catch (err) {
			throw new CustomError('Failed to delete relation from the database', err, {
				variables,
				query: isCollection
					? 'DELETE_COLLECTION_RELATIONS'
					: isAssignment
					? 'DELETE_ASSIGNMENT_RELATION'
					: 'DELETE_ITEM_RELATIONS',
			});
		}
	}
}
