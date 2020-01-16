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

	if (navItem.external_link) {
		return navItem.external_link;
	}

	console.error('Failed to generate navigation link for navigation item', { navItem });
	return buildLink(
		APP_PATH.ERROR,
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
	location: H.Location,
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
					component: <Component history={history} location={location} match={match} />,
					key: `nav-item-${navItem.id}`,
				};
			}
			// Navigate to link
			return {
				label: navItem.label,
				icon: navItem.icon_name,
				location: getLocation(navItem, t),
				target: navItem.link_target,
				key: `nav-item-${navItem.id}`,
			};
		}
	);
}
