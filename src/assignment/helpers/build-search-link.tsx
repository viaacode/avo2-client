import { Button } from '@viaa/avo2-components';
import React, { ReactNode } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { UrlUpdateType } from 'use-query-params';

import { APP_PATH } from '../../constants';
import { FilterState } from '../../search/search.types';
import { buildLink } from '../../shared/helpers';
import { ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS } from '../assignment.const';
import { PupilSearchFilterState } from '../assignment.types';

/**
 * Creates a link that navigates to the /search route
 * @param state
 * @param props
 * @param children
 */
export const buildGlobalSearchLink = (
	state: Partial<FilterState>,
	props?: Partial<Omit<LinkProps, 'to'>>,
	children?: ReactNode
): ReactNode => {
	const { page, ...rest } = state;

	return (
		<Link
			{...props}
			to={buildLink(
				APP_PATH.SEARCH.route,
				{},
				{
					...rest,
					filters: JSON.stringify(state.filters),
					...(page ? { page: String(page) } : {}),
				}
			)}
		>
			{children || state.filters?.serie?.[0]}
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
	(filterState: Partial<FilterState>): ReactNode => {
		return (
			<Button
				type="inline-link"
				label={filterState.filters?.serie?.[0]}
				onClick={() => {
					setFilterState({
						filters: filterState.filters,
						tab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.SEARCH,
						selectedSearchResultId: undefined,
					});
				}}
			/>
		);
	};
