import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/client';
import { type Avo } from '@viaa/avo2-types';
import { stringifyUrl } from 'query-string';

import { type Lookup_Enum_Relation_Types_Enum } from '../../generated/graphql-db-types.js';
import { CustomError } from '../../helpers/custom-error.js';
import { getEnv } from '../../helpers/env.js';

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
		if (!objectIds?.length) {
			return [];
		}
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
		if (!subjectIds?.length) {
			return [];
		}
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
		try {
			return fetchWithLogoutJson(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/relations`,
					query: {
						type,
						subjectIds: subjectIds ? subjectIds.join(',') : undefined,
						relationType,
						objectIds: objectIds ? objectIds.join(',') : undefined,
					},
				})
			);
		} catch (err) {
			throw new CustomError('Failed to get relation from the database', err, {
				type,
				subjectIds,
				relationType,
				objectIds,
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
		try {
			return fetchWithLogoutJson(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/relations`,
					query: {
						type,
						subjectId,
						relationType,
						objectId,
					},
				}),
				{
					method: 'POST',
				}
			);
		} catch (err) {
			throw new CustomError('Failed to insert relation into the database', err, {
				type,
				subjectId,
				relationType,
				objectId,
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
		try {
			fetchWithLogoutJson(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/relations`,
					query: {
						type,
						subjectId,
						relationType,
						objectId,
					},
				}),
				{
					method: 'DELETE',
				}
			);
		} catch (err) {
			throw new CustomError('Failed to delete relation from the database', err, {
				type,
				subjectId,
				relationType,
				objectId,
			});
		}
	}
}
