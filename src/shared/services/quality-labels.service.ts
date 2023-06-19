import { QualityLabel } from '../../collection/collection.types';
import {
	GetQualityLabelsDocument,
	GetQualityLabelsQuery,
	GetQualityLabelsQueryVariables,
} from '../generated/graphql-db-types';
import { CustomError } from '../helpers';

import { dataService } from './data-service';

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
				query: 'GET_QUALITY_LABELS',
			});
		}
	}
}
