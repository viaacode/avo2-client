import queryString from 'query-string';
import React, {
	FunctionComponent,
	ReactElement,
	ReactNode,
	ReactText,
	useEffect,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Link, NavLink, RouteComponentProps } from 'react-router-dom';

import {
	Avatar,
	Button,
	Container,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Icon,
	MenuContent,
	Navbar,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import LoginOptionsDropdown from '../../../authentication/components/LoginOptionsDropdown';
import PupilOrTeacherDropdown from '../../../authentication/components/PupilOrTeacherDropdown';
import {
	getFirstName,
	getProfileInitials,
	isLoggedIn,
} from '../../../authentication/helpers/get-profile-info';
import {
	redirectToClientPage,
	redirectToExternalPage,
} from '../../../authentication/helpers/redirects';
import { selectLoginMessage, selectUser } from '../../../authentication/store/selectors';
import { APP_PATH } from '../../../constants';
import { AppState } from '../../../store';
import toastService from '../../services/toast-service';
import { NavigationItem } from '../../types';

import { get, isNil, kebabCase, last, sortBy } from 'lodash-es';
import { buildLink } from '../../helpers';
import {
	AppContentNavElement,
	getNavigationItems,
	NavItemMap,
} from '../../services/navigation-items-service';
import './Navigation.scss';

const NAVIGATION_COMPONENTS: { [componentLabel: string]: FunctionComponent<any> } = {
	'<PupilOrTeacherDropdown>': PupilOrTeacherDropdown,
	'<LoginOptionsDropdown>': LoginOptionsDropdown,
};

export interface NavigationProps extends RouteComponentProps {
	user: Avo.User.User | undefined;
	loginMessage: Avo.Auth.LoginMessage;
}

/**
 * Main navigation bar component
 * @param history
 * @param location
 * @param loginMessage
 * @constructor
 */
export const Navigation: FunctionComponent<NavigationProps> = ({
	history,
	loginMessage,
	user,
	...rest
}) => {
	const [t] = useTranslation();

	const [areDropdownsOpen, setDropdownsOpen] = useState<{ [key: string]: boolean }>({});
	const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [primaryNavItems, setPrimaryNavItems] = useState<AppContentNavElement[]>([]);
	const [secondaryNavItems, setSecondaryNavItems] = useState<AppContentNavElement[]>([]);

	useEffect(() => {
		getNavigationItems().then((navItems: NavItemMap) => {
			setPrimaryNavItems(navItems['hoofdnavigatie-links']);
			setSecondaryNavItems(navItems['hoofdnavigatie-rechts']);
		});
	}, [user]);

	const getLocation = (navItem: AppContentNavElement): string => {
		if (!isNil(navItem.content_id)) {
			// Link to content block page
			return `/${navItem.content_id}/${kebabCase(navItem.label)}`;
		} else if (navItem.external_link) {
			return navItem.external_link;
		} else {
			console.error('Failed to generate navigation link for navigation item', { navItem });
			return buildLink(
				APP_PATH.ERROR,
				{},
				queryString.stringify({
					message: t('De pagina voor dit navigatie item kon niet worden gevonden'),
					icon: 'search',
				})
			);
		}
	};

	const mapNavElementsToNavigationItems = (navItems: AppContentNavElement[]): NavigationItem[] => {
		return sortBy(navItems, 'position').map(
			(navItem: AppContentNavElement): NavigationItem => {
				const location: string = getLocation(navItem);
				if (NAVIGATION_COMPONENTS[location]) {
					// Show component when clicking this nav item
					const Component = NAVIGATION_COMPONENTS[location];
					return {
						label: navItem.label,
						icon: navItem.icon_name,
						component: <Component history={history} {...rest} />,
						key: `nav-item-${navItem.id}`,
					};
				} else {
					// Navigate to link
					return {
						label: navItem.label,
						icon: navItem.icon_name,
						location: getLocation(navItem),
						target: navItem.link_target,
						key: `nav-item-${navItem.id}`,
					};
				}
			}
		);
	};

	const getPrimaryNavigationItems = (): NavigationItem[] => {
		return mapNavElementsToNavigationItems(primaryNavItems);
	};

	const getSecondaryNavigationItems = (): NavigationItem[] => {
		if (!secondaryNavItems || !secondaryNavItems.length) {
			return [];
		}
		const dynamicNavItems: NavigationItem[] = mapNavElementsToNavigationItems(secondaryNavItems);

		const logoutNavItem = last(dynamicNavItems) as NavigationItem;

		if (isLoggedIn(loginMessage, user)) {
			if (isMobileMenuOpen) {
				return dynamicNavItems;
			}
			// Navigatie items voor ingelogde gebruikers (dropdown onder profile avatar)
			return [
				{
					label: (
						<div className="c-navbar-profile-dropdown-button">
							<Avatar initials={getProfileInitials(user)} name={getFirstName(user) || ''} />
							<Icon name="caret-down" size="small" />
						</div>
					),
					component: (
						<MenuContent
							menuItems={[
								dynamicNavItems
									.slice(0, dynamicNavItems.length - 1)
									.map(navItem => ({ id: navItem.key as string, label: navItem.label as string })),
								[{ id: logoutNavItem.key as string, label: logoutNavItem.label as string }],
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

	const setDropdownOpen = (label: string, isOpen: boolean): void => {
		const openStates = { ...areDropdownsOpen };
		openStates[label] = isOpen;
		setDropdownsOpen(openStates);
	};

	const onToggleMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

	const closeAllDropdowns = () => setDropdownsOpen({});

	const handleMenuClick = (menuItemId: string | ReactText) => {
		try {
			const navItemId: number = parseInt(menuItemId.toString().substring('nav-item-'.length), 10);
			const navItem = secondaryNavItems.find(navItem => navItem.id === navItemId);
			if (!navItem) {
				console.error('Could not find navigation item by id', { menuItemId });
				toastService.danger(t('Dit menu item kon niet worden geopend (1)'));
				return;
			}
			const link = getLocation(navItem);
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
			toastService.danger(t('Dit menu item kon niet worden geopend (2)'));
		}
	};

	const renderNavLinkItem = (item: NavigationItem, className: string, exact: boolean) => {
		return (
			<li key={item.key}>
				{!!item.location && !item.location.includes('//') && (
					<NavLink
						to={item.location}
						className={className}
						activeClassName="c-nav__item--active"
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
						onOpen={() => setDropdownOpen(item.key, true)}
						onClose={() => setDropdownOpen(item.key, false)}
					>
						<DropdownButton>
							<div className={`${className} u-clickable`}>
								{item.icon && <Icon name={item.icon} />}
								{item.label}
							</div>
						</DropdownButton>
						<DropdownContent>
							{React.cloneElement(item.component, {
								closeDropdown: () => setDropdownOpen(item.key, false),
							})}
						</DropdownContent>
					</Dropdown>
				)}
			</li>
		);
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
											alt="Archief voor Onderwijs logo"
										/>
									</Link>
								</h1>
							</ToolbarItem>
							<ToolbarItem>
								<div className="u-mq-switch-main-nav-has-space">
									<ul className="c-nav">
										{getPrimaryNavigationItems().map(item =>
											renderNavLinkItem(item, 'c-nav__item c-nav__item--i', item.location === '/')
										)}
									</ul>
								</div>
							</ToolbarItem>
						</ToolbarLeft>
						<ToolbarRight>
							<ToolbarItem>
								<div className="u-mq-switch-main-nav-authentication">
									<ul className="c-nav">
										{getSecondaryNavigationItems().map(item =>
											renderNavLinkItem(item, 'c-nav__item c-nav__item--i', false)
										)}
									</ul>
								</div>
							</ToolbarItem>
							<ToolbarItem>
								<div className="u-mq-switch-main-nav-very-little-space">
									<Button
										icon="menu"
										type="borderless-i"
										ariaLabel={t('shared/components/navigation/navigation___menu')}
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
						<ul className="c-nav-mobile">
							{getPrimaryNavigationItems().map(item =>
								renderNavLinkItem(item, 'c-nav-mobile__item', item.location === '/')
							)}
						</ul>
						<ul className="c-nav-mobile">
							{getSecondaryNavigationItems().map(item =>
								renderNavLinkItem(item, 'c-nav-mobile__item', false)
							)}
						</ul>
					</Container>
				</Container>
			) : (
				<Navbar className="u-mq-switch-main-nav-little-space" background="inverse" placement="top">
					<Container mode="horizontal">
						<Toolbar>
							<ToolbarLeft>
								<div className="c-toolbar__item">
									<ul className="c-nav">
										{getPrimaryNavigationItems().map(item =>
											renderNavLinkItem(item, 'c-nav__item c-nav__item--i', false)
										)}
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
	loginMessage: selectLoginMessage(state),
	user: selectUser(state),
});

export default connect(mapStateToProps)(Navigation);
