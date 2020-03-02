import { last } from 'lodash-es';
import React, { FunctionComponent, ReactText, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';

import {
	Avatar,
	Button,
	Container,
	Icon,
	MenuContent,
	Navbar,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { getFirstName, getProfileInitials } from '../../../authentication/helpers/get-profile-info';
import {
	redirectToClientPage,
	redirectToExternalPage,
} from '../../../authentication/helpers/redirects';
import { selectUser } from '../../../authentication/store/selectors';
import { APP_PATH } from '../../../constants';
import { AppState } from '../../../store';
import { getLocation, mapNavElementsToNavigationItems } from '../../helpers/navigation';
import { ToastService } from '../../services';
import {
	AppContentNavElement,
	getNavigationItems,
	NavItemMap,
} from '../../services/navigation-items-service';
import { NavigationItemInfo } from '../../types';

import './Navigation.scss';
import NavigationItem from './NavigationItem';

export interface NavigationProps extends RouteComponentProps {
	user: Avo.User.User | undefined;
}

/**
 * Main navigation bar component
 * @param history
 * @param location
 * @param match
 * @param loginMessage
 * @param user
 * @constructor
 */
export const Navigation: FunctionComponent<NavigationProps> = ({
	history,
	location,
	match,
	user,
}) => {
	const [t] = useTranslation();

	const [areDropdownsOpen, setDropdownsOpen] = useState<{ [key: string]: boolean }>({});
	const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [primaryNavItems, setPrimaryNavItems] = useState<AppContentNavElement[]>([]);
	const [secondaryNavItems, setSecondaryNavItems] = useState<AppContentNavElement[]>([]);

	useEffect(() => {
		getNavigationItems()
			.then((navItems: NavItemMap) => {
				setPrimaryNavItems(navItems['hoofdnavigatie-links']);
				setSecondaryNavItems(navItems['hoofdnavigatie-rechts']);
			})
			.catch(err => {
				console.error('Failed to get navigation items', err);
				ToastService.danger(
					t(
						'shared/components/navigation/navigation___het-ophalen-van-de-navigatie-items-is-mislukt-probeer-later-opnieuw'
					)
				);
			});
	}, [history, t, user]);

	const mapNavItems = (navItems: NavigationItemInfo[]) => {
		return navItems.map(item => (
			<NavigationItem
				key={item.key}
				item={item}
				className="c-nav__item c-nav__item--i"
				exact={item.location === '/'}
				showActive={false}
				areDropdownsOpen={areDropdownsOpen}
				setDropdownsOpen={setDropdownsOpen}
				history={history}
				location={location}
				match={match}
			/>
		));
	};

	const getPrimaryNavigationItems = (): NavigationItemInfo[] => {
		return mapNavElementsToNavigationItems(primaryNavItems, history, match, t);
	};

	const getSecondaryNavigationItems = (): NavigationItemInfo[] => {
		if (!secondaryNavItems || !secondaryNavItems.length) {
			return [];
		}
		const dynamicNavItems: NavigationItemInfo[] = mapNavElementsToNavigationItems(
			secondaryNavItems,
			history,
			match,
			t
		);

		const logoutNavItem = last(dynamicNavItems) as NavigationItemInfo;

		if (
			(user && logoutNavItem.location !== APP_PATH.LOGOUT.route) ||
			(!user && logoutNavItem.location === APP_PATH.LOGOUT.route)
		) {
			// Avoid flashing the menu items for a second without them being in a dropdown menu
			return [];
		}

		if (user) {
			if (isMobileMenuOpen) {
				return dynamicNavItems;
			}
			// Navigatie items voor ingelogde gebruikers (dropdown onder profile avatar)
			return [
				{
					label: (
						<div className="c-navbar-profile-dropdown-button">
							<Avatar
								initials={getProfileInitials(user)}
								name={getFirstName(user) || ''}
							/>
							<Icon name="caret-down" size="small" />
						</div>
					),
					component: (
						<MenuContent
							menuItems={[
								dynamicNavItems
									.slice(0, dynamicNavItems.length - 1)
									.map(navItem => ({
										id: navItem.key as string,
										label: navItem.label as string,
									})),
								[
									{
										id: logoutNavItem.key as string,
										label: logoutNavItem.label as string,
									},
								],
							]}
							onClick={handleMenuClick}
						/>
					),
					key: 'profile',
				},
			];
		}

		// Navigatie items voor niet ingelogde gebruikers: items naast elkaar
		return dynamicNavItems;
	};

	const onToggleMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

	const closeAllDropdowns = () => setDropdownsOpen({});

	const handleMenuClick = (menuItemId: string | ReactText) => {
		try {
			const navItemId: number = parseInt(
				menuItemId.toString().substring('nav-item-'.length),
				10
			);
			const navItem = secondaryNavItems.find(navItem => navItem.id === navItemId);
			if (!navItem) {
				console.error('Could not find navigation item by id', { menuItemId });
				ToastService.danger(
					t(
						'shared/components/navigation/navigation___dit-menu-item-kon-niet-worden-geopend-1'
					)
				);
				return;
			}
			const link = getLocation(navItem, t);
			if (link.includes('//')) {
				// external link
				redirectToExternalPage(link, navItem.link_target || '_blank');
			} else {
				// Internal link to react page or to content block page
				redirectToClientPage(link, history);
			}
			closeAllDropdowns();
		} catch (err) {
			console.error('Failed to handle menu item click because it is not a number', err, {
				menuItemId,
			});
			ToastService.danger(
				t(
					'shared/components/navigation/navigation___dit-menu-item-kon-niet-worden-geopend-2'
				)
			);
		}
	};

	return (
		<>
			<Navbar background="inverse" position="fixed" placement="top">
				<Container mode="horizontal">
					<Toolbar>
						<ToolbarLeft>
							<ToolbarItem>
								<h1 className="c-brand">
									<Link to="/">
										<img
											className="c-brand__image"
											src="/images/avo-logo-i.svg"
											alt={t(
												'shared/components/navigation/navigation___archief-voor-onderwijs-logo'
											)}
										/>
									</Link>
								</h1>
							</ToolbarItem>
							<ToolbarItem>
								<div className="u-mq-switch-main-nav-has-space">
									<ul className="c-nav">
										{mapNavItems(getPrimaryNavigationItems())}
									</ul>
								</div>
							</ToolbarItem>
						</ToolbarLeft>
						<ToolbarRight>
							<ToolbarItem>
								<div className="u-mq-switch-main-nav-authentication">
									<ul className="c-nav">
										{mapNavItems(getSecondaryNavigationItems())}
									</ul>
								</div>
							</ToolbarItem>
							<ToolbarItem>
								<div className="u-mq-switch-main-nav-very-little-space">
									<Button
										icon="menu"
										type="borderless-i"
										ariaLabel={t(
											'shared/components/navigation/navigation___menu'
										)}
										onClick={onToggleMenu}
									/>
								</div>
							</ToolbarItem>
						</ToolbarRight>
					</Toolbar>
				</Container>
			</Navbar>
			{isMobileMenuOpen ? (
				<Container mode="horizontal">
					<Container mode="vertical">
						<ul className="c-nav-mobile">{mapNavItems(getPrimaryNavigationItems())}</ul>
						<ul className="c-nav-mobile">
							{mapNavItems(getSecondaryNavigationItems())}
						</ul>
					</Container>
				</Container>
			) : (
				<Navbar
					className="u-mq-switch-main-nav-little-space"
					background="inverse"
					placement="top"
				>
					<Container mode="horizontal">
						<Toolbar>
							<ToolbarLeft>
								<div className="c-toolbar__item">
									<ul className="c-nav">
										{mapNavItems(getPrimaryNavigationItems())}
									</ul>
								</div>
							</ToolbarLeft>
						</Toolbar>
					</Container>
				</Navbar>
			)}
		</>
	);
};

const mapStateToProps = (state: AppState) => ({
	user: selectUser(state),
});

export default connect(mapStateToProps)(Navigation);
