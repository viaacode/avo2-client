import { type Avo } from '@viaa/avo2-types';

import { APP_PATH } from '../../constants.js';
import { ASSIGNMENT_OVERVIEW_BACK_BUTTON_FILTERS } from '../../shared/constants/index.js';
import { buildLink } from '../../shared/helpers/build-link.js';
import { ASSIGNMENTS_ID } from '../../workspace/workspace.const.js';
import { ASSIGNMENT_CREATE_UPDATE_TABS } from '../assignment.const.js';

export function backToOverview(): string {
	return buildLink(
		APP_PATH.WORKSPACE_TAB.route,
		{
			tabId: ASSIGNMENTS_ID,
		},
		JSON.parse(localStorage.getItem(ASSIGNMENT_OVERVIEW_BACK_BUTTON_FILTERS) || '{}')
	);
}

export function toAssignmentDetail(assignment: Pick<Avo.Assignment.Assignment, 'id'>): string {
	return buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, { id: assignment.id });
}

export function toAssignmentResponsesOverview(
	assignment: Pick<Avo.Assignment.Assignment, 'id'>
): string {
	return buildLink(APP_PATH.ASSIGNMENT_EDIT_TAB.route, {
		id: assignment.id,
		tabId: ASSIGNMENT_CREATE_UPDATE_TABS.CLICKS,
	});
}
