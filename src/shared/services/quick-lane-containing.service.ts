import {
  type GetQuickLanesByContentIdQuery,
  type GetQuickLanesByContentIdQueryVariables,
} from '../generated/graphql-db-operations.js'
import { GetQuickLanesByContentIdDocument } from '../generated/graphql-db-react-query.js'
import { CustomError } from '../helpers/custom-error.js'
import { quickLaneUrlRecordToObject } from '../helpers/quick-lane-url-record-to-object.js'
import { type QuickLaneUrlObject } from '../types/index.js'

import { dataService } from './data-service.js'

export class QuickLaneContainingService {
  static async fetchQuickLanesByContentId(
    contentId: string,
  ): Promise<QuickLaneUrlObject[]> {
    try {
      const variables = {
        contentId,
      }

      const response = await dataService.query<
        GetQuickLanesByContentIdQuery,
        GetQuickLanesByContentIdQueryVariables
      >({
        variables,
        query: GetQuickLanesByContentIdDocument,
      })

      return response?.app_quick_lanes?.map(quickLaneUrlRecordToObject) || []
    } catch (err) {
      throw new CustomError(
        'Failed to get quick lane urls by content id from database',
        err,
        {
          contentId,
          query: 'GET_QUICK_LANE_BY_CONTENT_ID',
        },
      )
    }
  }
}
