import {
	AssignmentContent,
	AssignmentContentLabel,
	AssignmentLayout,
} from '@viaa/avo2-types/types/assignment';
import { UserProfile, UserSchema } from '@viaa/avo2-types/types/user';

export interface QuickLaneUrl {
	id: string;
	title: string;
	content?: AssignmentContent;
	content_id?: string;
	content_label?: AssignmentContentLabel;
	owner?: QuickLaneUrlOwner;
	owner_profile_id?: string;
	created_at?: string;
	updated_at?: string;
}

export interface QuickLaneUrlOwner extends Pick<UserProfile, 'id' | 'avatar'> {
	usersByuserId: Pick<UserSchema, 'full_name'>;
}

export interface QuickLaneUrlObject extends QuickLaneUrl {
	view_mode: AssignmentLayout;
}

export interface QuickLaneUrlRecord extends QuickLaneUrl {
	view_mode: 'full' | 'without_description';
}

export interface QuickLaneQueryResponse {
	app_quick_lanes: QuickLaneUrlRecord[];
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
