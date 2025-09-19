// eslint-disable-next-line import/no-unresolved
import AvoLogo from '@assets/images/avo-logo-i.svg';
import { ContentPagePreviewUserRoleSelector } from '@meemoo/admin-core-ui/dist/admin.mjs';
import {
	Avatar,
	Button,
	Container,
	Icon,
	IconName,
	MenuContent,
	Navbar,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { last } from 'lodash-es';
import React, { type FC, type ReactText, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link, type RouteComponentProps } from 'react-router-dom';
import { type Dispatch } from 'redux';

import {
	getProfileAvatar,
	getProfileInitials,
} from '../../../authentication/helpers/get-profile-info';
import { redirectToClientPage } from '../../../authentication/helpers/redirects/redirect-to-client-page';
import { redirectToExternalPage } from '../../../authentication/helpers/redirects/redirect-to-external-page';
import { getLoginStateAction } from '../../../authentication/store/actions';
import {
	selectLogin,
	selectLoginError,
	selectLoginLoading,
} from '../../../authentication/store/selectors';
import { APP_PATH } from '../../../constants';
import useTranslation from '../../../shared/hooks/useTranslation';
import { type AppState } from '../../../store';
import { getLocation, mapNavElementsToNavigationItems } from '../../helpers/navigation';
import { useAllGetNavItems } from '../../hooks/useAllGetNavItems';
import { ToastService } from '../../services/toast-service';
import { type NavigationItemInfo } from '../../types';

import { NavigationBarId } from './Navigation.const';
import { NavigationItem } from './NavigationItem';

import './Navigation.scss';

type NavigationParams = RouteComponentProps & {
	isPreviewRoute: boolean;
};

/**
 * Main navigation bar component
 * @param history
 * @param location
 * @param match
 * @param loginMessage
 * @constructor
 */
const Navigation: FC<
	NavigationParams & {
		loginState: Avo.Auth.LoginResponse | null;
		loginStateLoading: boolean;
		loginStateError: boolean;
		getLoginState: () => Dispatch;
	}
> = ({
	loginState,
	loginStateLoading,
	loginStateError,
	getLoginState,
	history,
	location,
	match,
	isPreviewRoute,
}) => {
	const { tText, tHtml } = useTranslation();

	const [areDropdownsOpen, setDropdownsOpen] = useState<{ [key: string]: boolean }>({});
	const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

	const { data: allNavItems } = useAllGetNavItems();

	/**
	 * @deprecated
	 */
	const user = (loginState as Avo.Auth.LoginResponseLoggedIn)?.userInfo;
	const commonUser = (loginState as Avo.Auth.LoginResponseLoggedIn)?.commonUserInfo;

	/**
	 * Computed
	 */
	const navItemsLeft = allNavItems?.[NavigationBarId.MAIN_NAVIGATION_LEFT] || [];
	const navItemsRight = allNavItems?.[NavigationBarId.MAIN_NAVIGATION_RIGHT] || [];
	const navItemsProfileDropdown = allNavItems?.[NavigationBarId.PROFILE_DROPDOWN] || [];

	useEffect(() => {
		if (!loginState && !loginStateLoading && !loginStateError) {
			getLoginState();
			return;
		}
	});

	const mapNavItems = (navItems: NavigationItemInfo[], isMobile: boolean) => {
		return navItems.map((item) => (
			<NavigationItem
				key={item.key}
				item={item}
				className={'c-nav__item c-nav__item--i'}
				exact={item.location === '/'}
				showActive={false}
				areDropdownsOpen={areDropdownsOpen}
				setDropdownsOpen={setDropdownsOpen}
				isMobile={isMobile}
				history={history}
				location={location}
				match={match}
				onNavigate={() => setMobileMenuOpen(false)}
			/>
		));
	};

	const getNavigationItemsLeft = (): NavigationItemInfo[] => {
		return mapNavElementsToNavigationItems(navItemsLeft, tText);
	};

	const getNavigationItemsRight = (): NavigationItemInfo[] => {
		if (
			(!navItemsRight || !navItemsRight.length) &&
			(!navItemsProfileDropdown || !navItemsProfileDropdown.length)
		) {
			return [];
		}
		const dynamicNavItemsRight: NavigationItemInfo[] = mapNavElementsToNavigationItems(
			navItemsRight,
			tText
		);
		const dynamicNavItemsProfileDropdown: NavigationItemInfo[] =
			mapNavElementsToNavigationItems(navItemsProfileDropdown, tText);

		const logoutNavItem = last(dynamicNavItemsProfileDropdown) as NavigationItemInfo;

		if (
			// (user && logoutNavItem.location !== APP_PATH.LOGOUT.route) ||
			!commonUser &&
			logoutNavItem?.location === APP_PATH.LOGOUT.route
		) {
			// Avoid flashing the menu items for a second without them being in a dropdown menu
			return [];
		}

		if (commonUser) {
			if (isMobileMenuOpen) {
				return [...dynamicNavItemsRight, ...dynamicNavItemsProfileDropdown];
			}
			// Navigatie items voor ingelogde gebruikers (dropdown onder profile avatar)
			return [
				...dynamicNavItemsRight,
				{
					label: (
						<div className="c-navbar-profile-dropdown-button">
							<Avatar
								initials={getProfileInitials(commonUser)}
								name={commonUser?.firstName || ''}
								image={getProfileAvatar(commonUser)}
							/>
							<Icon name={IconName.caretDown} size="small" />
						</div>
					),
					component: (
						<MenuContent
							menuItems={[
								dynamicNavItemsProfileDropdown
									.slice(0, dynamicNavItemsProfileDropdown.length - 1)
									.map((navItem) => ({
										id: navItem.key as string,
										label: navItem.label as string,
									})),
								[
									{
										id: logoutNavItem?.key as string,
										label: logoutNavItem?.label as string,
									},
								],
							]}
							onClick={handleMenuClick}
						/>
					),
					target: '_self',
					key: 'profile',
				},
			];
		}

		// Navigatie items voor niet ingelogde gebruikers: items naast elkaar
		return dynamicNavItemsRight;
	};

	const onToggleMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

	const closeAllDropdowns = () => setDropdownsOpen({});

	const handleMenuClick = (menuItemId: string | ReactText) => {
		try {
			const navItemId: number = parseInt(
				menuItemId.toString().substring('nav-item-'.length),
				10
			);
			const navItem = [...navItemsRight, ...navItemsProfileDropdown].find(
				(navItem) => navItem.id === navItemId
			);
			if (!navItem) {
				console.error('Could not find navigation item by id', { menuItemId });
				ToastService.danger(
					tHtml(
						'shared/components/navigation/navigation___dit-menu-item-kon-niet-worden-geopend-1'
					)
				);
				return;
			}
			const link = getLocation(navItem, tText);
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
				tHtml(
					'shared/components/navigation/navigation___dit-menu-item-kon-niet-worden-geopend-2'
				)
			);
		}
	};

	return (
		<>
			<Navbar background="inverse" position="fixed" placement="top" autoHeight={true}>
				{isPreviewRoute && (
					<Container background="white">
						<Container mode="horizontal" className="u-d-flex">
							<ContentPagePreviewUserRoleSelector
								className="c-content-page-preview-selector"
								commonUser={commonUser}
							/>
						</Container>
					</Container>
				)}
				<Container mode="horizontal">
					<Toolbar>
						<ToolbarLeft>
							<ToolbarItem>
								<h1 className="c-brand">
									<Link
										to={
											user
												? APP_PATH.LOGGED_IN_HOME.route
												: APP_PATH.LOGGED_OUT_HOME.route
										}
									>
										<img alt="Archief voor Onderwijs logo" src={AvoLogo} />
									</Link>
								</h1>
							</ToolbarItem>
							<ToolbarItem>
								<div className="u-mq-switch-main-nav-has-space">
									<ul className="c-nav">
										{mapNavItems(getNavigationItemsLeft(), false)}
									</ul>
								</div>
							</ToolbarItem>
						</ToolbarLeft>
						<ToolbarRight>
							<ToolbarItem>
								<div className="u-mq-switch-main-nav-authentication">
									<ul className="c-nav">
										{mapNavItems(getNavigationItemsRight(), false)}
									</ul>
								</div>
							</ToolbarItem>
							<ToolbarItem>
								<div className="u-mq-switch-main-nav-very-little-space">
									<Button
										icon={IconName.menu}
										type="borderless-i"
										title={tText(
											'shared/components/navigation/navigation___open-het-navigatie-menu'
										)}
										ariaLabel={tText(
											'shared/components/navigation/navigation___open-het-navigatie-menu'
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
				<Container mode="horizontal" className="c-mobile-menu">
					<Container mode="vertical">
						<ul className="c-nav-mobile">
							{mapNavItems(getNavigationItemsLeft(), true)}
						</ul>
						<ul className="c-nav-mobile">
							{mapNavItems(getNavigationItemsRight(), true)}
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
										{mapNavItems(getNavigationItemsLeft(), false)}
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
	loginState: selectLogin(state),
	loginStateLoading: selectLoginLoading(state),
	loginStateError: selectLoginError(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		getLoginState: () => dispatch(getLoginStateAction() as any),
	};
};

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Navigation)
) as unknown as FC<NavigationParams>;
