import * as H from 'history';
import { TFunction } from 'i18next';
import { isNil, kebabCase, sortBy } from 'lodash-es';
import queryString from 'query-string';
import React, { FunctionComponent } from 'react';
import { match as Match } from 'react-router';

import LoginOptionsDropdown from '../../authentication/components/LoginOptionsDropdown';
import PupilOrTeacherDropdown from '../../authentication/components/PupilOrTeacherDropdown';
import { APP_PATH } from '../../constants';
import { AppContentNavElement } from '../services/navigation-items-service';
import { NavigationItemInfo } from '../types';
import { buildLink } from './link';

const NAVIGATION_COMPONENTS: { [componentLabel: string]: FunctionComponent<any> } = {
	'<PupilOrTeacherDropdown>': PupilOrTeacherDropdown,
	'<LoginOptionsDropdown>': LoginOptionsDropdown,
};

export type BooleanDictionary = { [id: string]: boolean };

export function getLocation(navItem: AppContentNavElement, t: TFunction): string {
	if (!isNil(navItem.content_id)) {
		// Link to content block page
		return `/${navItem.content_id}/${kebabCase(navItem.label)}`;
	}

	if (navItem.content_path) {
		return navItem.content_path;
	}

	console.error('Failed to generate navigation link for navigation item', { navItem });
	return buildLink(
		APP_PATH.ERROR.route,
		{},
		queryString.stringify({
			message: t(
				'shared/helpers/navigation___de-pagina-voor-dit-navigatie-item-kon-niet-worden-gevonden'
			),
			icon: 'search',
		})
	);
}

export function mapNavElementsToNavigationItems(
	navItems: AppContentNavElement[],
	history: H.History,
	match: Match<any>,
	t: TFunction
): NavigationItemInfo[] {
	return sortBy(navItems, 'position').map(
		(navItem: AppContentNavElement): NavigationItemInfo => {
			const location: string = getLocation(navItem, t);

			if (NAVIGATION_COMPONENTS[location]) {
				// Show component when clicking this nav item
				const Component = NAVIGATION_COMPONENTS[location];

				return {
					label: navItem.label,
					icon: navItem.icon_name,
					tooltip: (navItem as any).tooltip, // TODO: Remove 'as any' when typings 2.16 is released.
					component: <Component history={history} location={location} match={match} />,
					key: `nav-item-${navItem.id}`,
				};
			}

			// Navigate to link
			return {
				label: navItem.label,
				icon: navItem.icon_name,
				tooltip: (navItem as any).tooltip, // TODO: Remove 'as any' when typings 2.16 is released.
				location: getLocation(navItem, t),
				target: navItem.link_target,
				key: `nav-item-${navItem.id}`,
			};
		}
	);
}
