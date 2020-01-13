import * as H from 'history';
import { TFunction } from 'i18next';
import { isNil, kebabCase, sortBy } from 'lodash-es';
import queryString from 'query-string';
import React, { FunctionComponent } from 'react';
import { match } from 'react-router';
import { NavLink } from 'react-router-dom';

import { Dropdown, DropdownButton, DropdownContent, Icon } from '@viaa/avo2-components';

import LoginOptionsDropdown from '../../authentication/components/LoginOptionsDropdown';
import PupilOrTeacherDropdown from '../../authentication/components/PupilOrTeacherDropdown';
import { APP_PATH } from '../../constants';
import { AppContentNavElement } from '../services/navigation-items-service';
import { NavigationItem } from '../types';
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
	} else {
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
}

export function mapNavElementsToNavigationItems(
	navItems: AppContentNavElement[],
	history: H.History,
	location: H.Location,
	match: match<any>,
	t: TFunction
): NavigationItem[] {
	return sortBy(navItems, 'position').map(
		(navItem: AppContentNavElement): NavigationItem => {
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

const setDropdownOpen = (
	label: string,
	isOpen: boolean,
	areDropdownsOpen: BooleanDictionary,
	setDropdownsOpen: (areDropdownsOpen: BooleanDictionary) => void
): void => {
	const openStates = { ...areDropdownsOpen };
	openStates[label] = isOpen;
	setDropdownsOpen(openStates);
};

export function renderNavLinkItem(
	item: NavigationItem,
	className: string,
	exact: boolean,
	showActive: boolean,
	areDropdownsOpen: BooleanDictionary,
	setDropdownsOpen: (areDropdownsOpen: BooleanDictionary) => void
) {
	return (
		<li key={item.key}>
			{!!item.location && !item.location.includes('//') && (
				<NavLink
					to={item.location}
					className={className}
					activeClassName={showActive ? 'c-nav__item--active' : undefined}
					exact={exact}
				>
					{item.icon && <Icon name={item.icon} />}
					{item.label}
				</NavLink>
			)}
			{!!item.location && item.location.includes('//') && (
				<a href={item.location} className={className} target={item.target || '_blank'}>
					{item.icon && <Icon name={item.icon} />}
					{item.label}
				</a>
			)}
			{!!item.component && (
				<Dropdown
					menuWidth="fit-content"
					placement="bottom-end"
					isOpen={areDropdownsOpen[item.key] || false}
					onOpen={() => setDropdownOpen(item.key, true, areDropdownsOpen, setDropdownsOpen)}
					onClose={() => setDropdownOpen(item.key, false, areDropdownsOpen, setDropdownsOpen)}
				>
					<DropdownButton>
						<div className={`${className} u-clickable`}>
							{item.icon && <Icon name={item.icon} />}
							{item.label}
						</div>
					</DropdownButton>
					<DropdownContent>
						{React.cloneElement(item.component, {
							closeDropdown: () =>
								setDropdownOpen(item.key, false, areDropdownsOpen, setDropdownsOpen),
						})}
					</DropdownContent>
				</Dropdown>
			)}
		</li>
	);
}
