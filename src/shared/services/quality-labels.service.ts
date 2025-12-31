import { type QualityLabel } from '../../collection/collection.types';
import {
  type GetQualityLabelsQuery,
  type GetQualityLabelsQueryVariables,
} from '../generated/graphql-db-operations';
import { GetQualityLabelsDocument } from '../generated/graphql-db-react-query';
import { CustomError } from '../helpers/custom-error';

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
        query: 'GetQualityLabels',
      });
    }
  }
}
