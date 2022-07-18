import { Button } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { UrlUpdateType } from 'use-query-params';

import { APP_PATH } from '../../constants';
import { buildLink } from '../../shared/helpers';
import { ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS } from '../assignment.const';
import { PupilSearchFilterState } from '../assignment.types';

/**
 * Creates a link that navigates to the /search route
 * @param filters
 */
export const buildGlobalSearchLink = (filters: Partial<Avo.Search.Filters>): ReactNode => {
	return (
		<Link to={buildLink(APP_PATH.SEARCH.route, {}, { filters: JSON.stringify(filters) })}>
			{filters.serie?.[0]}
		</Link>
	);
};

/**
 * Generates a link that sets the filter state (used for pupil search inside an assignment)
 * @param setFilterState
 */
export const buildAssignmentSearchLink =
	(setFilterState: (state: PupilSearchFilterState, urlPushType?: UrlUpdateType) => void) =>
	// eslint-disable-next-line react/display-name
	(filters: Partial<Avo.Search.Filters>): ReactNode => {
		return (
			<Button
				type="inline-link"
				label={filters.serie?.[0]}
				onClick={() => {
					setFilterState({
						filters,
						tab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.SEARCH,
						selectedSearchResultId: undefined,
					});
				}}
			/>
		);
	};
