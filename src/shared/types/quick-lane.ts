import { type Avo } from '@viaa/avo2-types'

import { type AssignmentLayout } from '../../assignment/assignment.types';
import { type DateRange } from '../components/DateRangeDropdown/DateRangeDropdown';
import { type QuickLaneType } from '../components/QuickLaneContent/QuickLaneContent.types';
import { type GetQuickLanesByContentIdQuery } from '../generated/graphql-db-operations';

interface QuickLaneUrl {
  id: string
  title: string
  content?:
    | Avo.Assignment.Assignment
    | Avo.Collection.Collection
    | Avo.Item.Item
  content_id?: string
  content_label?: QuickLaneType
  owner?: Avo.User.Profile
  owner_profile_id?: string
  created_at?: string
  updated_at?: string
  start_oc?: number | null
  end_oc?: number | null
}

export interface QuickLaneUrlObject extends QuickLaneUrl {
  view_mode: AssignmentLayout
}

export type QuickLaneUrlRecord =
  GetQuickLanesByContentIdQuery['app_quick_lanes'][0]

export interface QuickLaneOverviewFilterState {
  author: string[]
  columns: any[]
  content_label: QuickLaneType[]
  created_at?: DateRange
  page: number
  query?: string
  sort_column?: string
  sort_order?: Avo.Search.OrderDirection
  updated_at?: DateRange
}
