import { type QualityLabel } from '../../collection/collection.types.js';
import {
	type GetQualityLabelsQuery,
	type GetQualityLabelsQueryVariables,
} from '../generated/graphql-db-operations.js';
import { GetQualityLabelsDocument } from '../generated/graphql-db-react-query.js';
import { CustomError } from '../helpers/custom-error.js';

import { dataService } from './data-service.js';

export class QualityLabelsService {
	static async fetchQualityLabels(): Promise<QualityLabel[]> {
		try {
			const response = await dataService.query<
				GetQualityLabelsQuery,
				GetQualityLabelsQueryVariables
			>({
				query: GetQualityLabelsDocument,
			});

			return response.lookup_enum_collection_labels as QualityLabel[];
		} catch (err) {
			throw new CustomError('Failed to get quality labels', err, {
				query: 'GetQualityLabels',
			});
		}
	}
}
