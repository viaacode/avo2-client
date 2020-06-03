import { get } from 'lodash-es';

import { CustomError } from '../../helpers';
import { ApolloCacheManager, dataService } from '../data-service';

import { INSERT_COLLECTION_RELATION, INSERT_ITEM_RELATION } from './relation.gql';
import { RelationType } from './relation.types';

export class RelationService {
	public static async insertRelation(
		type: 'collection' | 'item',
		objectId: string,
		subjectId: string,
		relationType: RelationType
	): Promise<number> {
		let variables: any;
		try {
			variables = {
				relationType,
				objectId,
				subjectId,
			};
			const response = await dataService.mutate({
				variables,
				mutation: type === 'collection' ? INSERT_COLLECTION_RELATION : INSERT_ITEM_RELATION,
				update: ApolloCacheManager.clearCollectionCache,
			});
			if (response.errors) {
				throw new CustomError('Failed due to graphql errors', null, { response });
			}
			const relationId = get(
				response,
				'data.insert_app_collection_relations.returning[0].id'
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
				query:
					type === 'collection' ? 'INSERT_COLLECTION_RELATION' : 'INSERT_ITEM_RELATION',
			});
		}
	}
}
