import { Avo } from '@viaa/avo2-types'

export type QuickLaneColumn =
  | 'title'
  | 'created_at'
  | 'updated_at'
  | 'content_label'
  | 'author'
  | 'organisation'
  | 'action'

export const QUICK_LANE_DEFAULTS = {
  sort_column: 'created_at',
  sort_order: Avo.Search.OrderDirection.DESC,
}
