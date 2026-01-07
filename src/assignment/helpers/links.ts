import { AvoAssignmentAssignment } from '@viaa/avo2-types';

import { APP_PATH } from '../../constants';
import { ASSIGNMENT_OVERVIEW_BACK_BUTTON_FILTERS } from '../../shared/constants';
import { buildLink, RouteParams } from '../../shared/helpers/build-link';
import { CustomError } from '../../shared/helpers/custom-error.ts';
import { isServerSideRendering } from '../../shared/helpers/routing/is-server-side-rendering.ts';
import { ASSIGNMENTS_ID } from '../../workspace/workspace.const';
import { ASSIGNMENT_CREATE_UPDATE_TABS } from '../assignment.const';

export function backToOverview(): string {
  let backButtonFilters = {};
  if (!isServerSideRendering()) {
    // Server side rendering doesn't have access to local storage
    try {
      backButtonFilters = JSON.parse(
        localStorage.getItem(ASSIGNMENT_OVERVIEW_BACK_BUTTON_FILTERS) || '{}',
      );
    } catch (err) {
      console.error(
        new CustomError(
          'Failed to parse back button filters from local storage',
          err,
          {
            key: ASSIGNMENT_OVERVIEW_BACK_BUTTON_FILTERS,
          },
        ),
      );
    }
  }
  return buildLink(
    APP_PATH.WORKSPACE_TAB.route,
    {
      tabId: ASSIGNMENTS_ID,
    },
    backButtonFilters,
  );
}

export function toAssignmentDetail(
  assignment: Pick<AvoAssignmentAssignment, 'id'>,
): string {
  return buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, { id: assignment.id });
}

export function toAssignmentResponsesOverview(
  assignment: Pick<AvoAssignmentAssignment, 'id'>,
): string {
  return buildLink(APP_PATH.ASSIGNMENT_EDIT_TAB.route, {
    id: assignment.id,
    tabId: ASSIGNMENT_CREATE_UPDATE_TABS.CLICKS,
  });
}
