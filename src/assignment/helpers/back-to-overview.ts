import { APP_PATH } from '../../constants';
import { ASSIGNMENT_OVERVIEW_BACK_BUTTON_FILTERS } from '../../shared/constants';
import { buildLink } from '../../shared/helpers';
import { ASSIGNMENTS_ID } from '../../workspace/workspace.const';

export function backToOverview() {
	return buildLink(
		APP_PATH.WORKSPACE_TAB.route,
		{
			tabId: ASSIGNMENTS_ID,
		},
		JSON.parse(localStorage.getItem(ASSIGNMENT_OVERVIEW_BACK_BUTTON_FILTERS) || '{}')
	);
}
