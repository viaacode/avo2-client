import type { Avo } from '@viaa/avo2-types';

import { DateRange } from '../components/DateRangeDropdown/DateRangeDropdown';
import {
	GetQuickLanesByContentIdQuery,
	Lookup_Enum_Assignment_Content_Labels_Enum,
} from '../generated/graphql-db-types';

export interface QuickLaneUrl {
	id: string;
	title: string;
	content?: Avo.Assignment.Content;
	content_id?: string;
	content_label?: Lookup_Enum_Assignment_Content_Labels_Enum;
	owner?: Avo.User.Profile;
	owner_profile_id?: string;
	created_at?: string;
	updated_at?: string;
}

export interface QuickLaneUrlObject extends QuickLaneUrl {
	view_mode: Avo.Assignment.Layout;
}

export type QuickLaneUrlRecord = GetQuickLanesByContentIdQuery['app_quick_lanes'][0];

export interface QuickLaneOverviewFilterState {
	author: string[];
	columns: any[];
	content_label: Lookup_Enum_Assignment_Content_Labels_Enum[];
	created_at?: DateRange;
	page: number;
	query?: string;
	sort_column?: string;
	sort_order?: Avo.Search.OrderDirection;
	updated_at?: DateRange;
}
