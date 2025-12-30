import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/client';
import {
	AvoAssignmentAssignment,
	AvoAssignmentRelationEntry,
	AvoCollectionCollection,
	AvoCollectionRelationEntry,
	AvoItemItem,
} from '@viaa/avo2-types';
import { stringifyUrl } from 'query-string';
import { type Lookup_Enum_Relation_Types_Enum } from '../../generated/graphql-db-types';
import { CustomError } from '../../helpers/custom-error';
import { getEnv } from '../../helpers/env';

export class RelationService {
  public static async fetchRelationsByObject(
    type: 'collection' | 'assignment' | 'item',
    relationType: Lookup_Enum_Relation_Types_Enum,
    objectIds: string[],
  ): Promise<
    | AvoCollectionRelationEntry<
        AvoItemItem | AvoCollectionCollection | AvoAssignmentAssignment
      >[]
    | AvoAssignmentRelationEntry<AvoAssignmentAssignment>[]
  > {
    if (!objectIds?.length) {
      return [];
    }
    return this.fetchRelations(type, null, relationType, objectIds);
  }

  public static async fetchRelationsBySubject(
    type: 'collection' | 'assignment' | 'item',
    subjectIds: string[],
    relationType: Lookup_Enum_Relation_Types_Enum,
  ): Promise<
    | AvoCollectionRelationEntry<
        AvoItemItem | AvoCollectionCollection | AvoAssignmentAssignment
      >[]
    | AvoAssignmentRelationEntry<AvoAssignmentAssignment>[]
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
    objectIds: string[] | null,
  ): Promise<
    | AvoCollectionRelationEntry<
        AvoItemItem | AvoCollectionCollection | AvoAssignmentAssignment
      >[]
    | AvoAssignmentRelationEntry<AvoAssignmentAssignment>[]
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
        }),
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
    objectId: string,
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
        },
      );
    } catch (err) {
      throw new CustomError(
        'Failed to insert relation into the database',
        err,
        {
          type,
          subjectId,
          relationType,
          objectId,
        },
      );
    }
  }

  public static async deleteRelationsByObject(
    type: 'collection' | 'assignment' | 'item',
    relationType: Lookup_Enum_Relation_Types_Enum,
    objectId: string,
  ): Promise<void> {
    return RelationService.deleteRelations(type, null, relationType, objectId);
  }

  public static async deleteRelationsBySubject(
    type: 'collection' | 'assignment' | 'item',
    subjectId: string,
    relationType: Lookup_Enum_Relation_Types_Enum,
  ): Promise<void> {
    return RelationService.deleteRelations(type, subjectId, relationType, null);
  }

  private static async deleteRelations(
    type: 'collection' | 'assignment' | 'item',
    subjectId: string | null,
    relationType: Lookup_Enum_Relation_Types_Enum,
    objectId: string | null,
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
        },
      );
    } catch (err) {
      throw new CustomError(
        'Failed to delete relation from the database',
        err,
        {
          type,
          subjectId,
          relationType,
          objectId,
        },
      );
    }
  }
}
