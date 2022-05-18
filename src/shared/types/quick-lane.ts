import {
	AssignmentContent,
	AssignmentContentLabel,
	AssignmentLayout,
} from '@viaa/avo2-types/types/assignment';
import { SearchOrderDirection } from '@viaa/avo2-types/types/search';
import { UserProfile } from '@viaa/avo2-types/types/user';

import { DateRange } from '../components/DateRangeDropdown/DateRangeDropdown';

export interface QuickLaneUrl {
	id: string;
	title: string;
	content?: AssignmentContent;
	content_id?: string;
	content_label?: AssignmentContentLabel;
	owner?: UserProfile;
	owner_profile_id?: string;
	created_at?: string;
	updated_at?: string;
}

export interface QuickLaneUrlObject extends QuickLaneUrl {
	view_mode: AssignmentLayout;
}

export interface QuickLaneUrlRecord extends QuickLaneUrl {
	view_mode: 'full' | 'without_description';
}

export interface QuickLaneQueryResponse {
	app_quick_lanes: QuickLaneUrlRecord[];
	app_quick_lanes_aggregate: {
		aggregate: {
			count: number;
		};
	};
}

export interface QuickLaneInsertResponse {
	insert_app_quick_lanes: QuickLaneMutateResponse;
}

export interface QuickLaneUpdateResponse {
	update_app_quick_lanes: QuickLaneMutateResponse;
}

export interface QuickLaneMutateResponse {
	affected_rows: number;
	returning: QuickLaneUrlRecord[];
}

export interface QuickLaneOverviewFilterState {
	author: string[];
	columns: any[];
	content_label: AssignmentContentLabel[];
	created_at?: DateRange;
	page: number;
	query?: string;
	sort_column?: string;
	sort_order?: SearchOrderDirection;
	updated_at?: DateRange;
}
