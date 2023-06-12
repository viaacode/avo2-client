import { APP_PATH } from '../../constants';
import { ASSIGNMENT_OVERVIEW_BACK_BUTTON_FILTERS } from '../../shared/constants';
import { buildLink } from '../../shared/helpers';
import { ASSIGNMENTS_ID } from '../../workspace/workspace.const';
import { ASSIGNMENT_CREATE_UPDATE_TABS } from '../assignment.const';
import { Assignment_v2 } from '../assignment.types';

export function backToOverview(): string {
	return buildLink(
		APP_PATH.WORKSPACE_TAB.route,
		{
			tabId: ASSIGNMENTS_ID,
		},
		JSON.parse(localStorage.getItem(ASSIGNMENT_OVERVIEW_BACK_BUTTON_FILTERS) || '{}')
	);
}

export function toAssignmentDetail(assignment: Pick<Assignment_v2, 'id'>): string {
	return buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, { id: assignment.id });
}

export function toAssignmentResponsesOverview(assignment: Pick<Assignment_v2, 'id'>): string {
	return buildLink(APP_PATH.ASSIGNMENT_EDIT_TAB.route, {
		id: assignment.id,
		tabId: ASSIGNMENT_CREATE_UPDATE_TABS.CLICKS,
	});
}
