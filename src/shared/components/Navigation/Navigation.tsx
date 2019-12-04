import React, { FunctionComponent, ReactText, useState } from 'react';
import { connect } from 'react-redux';
import { Link, NavLink, RouteComponentProps, withRouter } from 'react-router-dom';

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

import PupilOrTeacherDropdown from '../../../authentication/components/PupilOrTeacherDropdown';
import {
	getProfileInitials,
	getProfileName,
} from '../../../authentication/helpers/get-profile-info';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { selectLogin } from '../../../authentication/store/selectors';
import { LoginMessage } from '../../../authentication/store/types';
import { APP_PATH } from '../../../constants';
import { SETTINGS_PATH } from '../../../settings/settings.const';
import { AppState } from '../../../store';
import toastService from '../../services/toast-service';
import { NavigationItem } from '../../types';

import './Navigation.scss';

export interface NavigationProps extends RouteComponentProps {
	loginState: Avo.Auth.LoginResponse | null;
}

/**
 * Main navigation bar component
 * @param history
 * @param loginState
 * @constructor
 */
const Navigation: FunctionComponent<NavigationProps> = ({ history, loginState }) => {
	const [areDropdownsOpen, setDropdownsOpen] = useState<{ [key: string]: boolean }>({});
	const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

	const getPrimaryNavigationItems = (): NavigationItem[] => {
		const isLoggedIn = loginState && loginState.message === LoginMessage.LOGGED_IN;
		if (isLoggedIn) {
			return [
				{ label: 'Home', location: APP_PATH.LOGGED_IN_HOME, key: 'teachers' },
				{
					label: 'Zoeken',
					location: APP_PATH.SEARCH,
					icon: 'search',
					key: 'pupils',
				},
				{ label: 'Ontdek', location: APP_PATH.DISCOVER, key: 'home' },
				{
					label: 'Mijn Werkruimte',
					location: APP_PATH.WORKSPACE,
					icon: 'briefcase',
					key: 'search',
				},
				{ label: 'Projecten', location: APP_PATH.PROJECTS, key: 'discover' },
				{ label: 'Nieuws', location: APP_PATH.NEWS, key: 'workspace' },
			];
		} else {
			return [
				{ label: 'Voor leerkrachten', location: APP_PATH.FOR_TEACHERS, key: 'teachers' },
				{ label: 'Voor leerlingen', location: APP_PATH.FOR_PUPILS, key: 'pupils' },
				{ label: 'Projecten', location: APP_PATH.PROJECTS, key: 'projects' },
				{ label: 'Nieuws', location: APP_PATH.NEWS, key: 'news' },
			];
		}
	};

	const getSecondaryNavigationItems = (): NavigationItem[] => {
		const isLoggedIn = loginState && loginState.message === LoginMessage.LOGGED_IN;
		if (isLoggedIn) {
			if (isMobileMenuOpen) {
				return [
					{ label: 'Instellingen', location: APP_PATH.SETTINGS, key: 'settings' },
					{ label: 'Hulp', location: APP_PATH.HELP, key: 'help' },
					{
						label: 'Rapporteer feedback of probleem',
						location: APP_PATH.FEEDBACK,
						key: 'feedback',
					},
					{ label: 'Logout', location: APP_PATH.LOGOUT, key: 'logout' },
				];
			} else {
				return [
					{
						label: (
							<div className="c-navbar-profile-dropdown-button">
								<Avatar initials={getProfileInitials()} name={getProfileName()} />
								<Icon name="caret-down" size="small" />
							</div>
						),
						component: (
							<MenuContent
								menuItems={[
									[
										{ id: 'settings', label: 'Instellingen' },
										{ id: 'help', label: 'Hulp' },
										{ id: 'feedback', label: 'Rapporteer feedback of probleem' },
									],
									[{ id: 'logout', label: 'Logout' }],
								]}
								onClick={handleMenuClick}
							/>
						),
						key: 'profile',
					},
				];
			}
		} else {
			return [
				{ label: 'Account aanmaken', component: <PupilOrTeacherDropdown />, key: 'createAccount' },
				{ label: 'Aanmelden', location: APP_PATH.REGISTER_OR_LOGIN, key: 'login' },
			];
		}
	};

	const setDropdownOpen = (label: string, isOpen: boolean): void => {
		const openStates = { ...areDropdownsOpen };
		openStates[label] = isOpen;
		setDropdownsOpen(openStates);
	};

	const onToggleMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

	const onCloseMenu = () => setMobileMenuOpen(false);

	const closeAllDropdowns = () => setDropdownsOpen({});

	const handleMenuClick = (menuItemId: string | ReactText) => {
		switch (menuItemId) {
			case 'settings':
				redirectToClientPage(SETTINGS_PATH.SETTINGS, history);
				break;

			case 'help':
				toastService.info('Nog niet geimplementeerd');
				break;

			case 'feedback':
				toastService.info('Nog niet geimplementeerd');
				break;

			case 'logout':
				redirectToClientPage(APP_PATH.LOGOUT, history);
				break;

			default:
				toastService.info('Nog niet geimplementeerd');
				break;
		}
		closeAllDropdowns();
	};

	const renderNavLinkItem = (item: NavigationItem, className: string, exact: boolean) => {
		return (
			<li key={`${item.location}-${item.key}`}>
				{!!item.location && (
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
							<>
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
							</>
						</ToolbarLeft>
						<ToolbarRight>
							<>
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
											ariaLabel="menu"
											onClick={onToggleMenu}
										/>
									</div>
								</ToolbarItem>
							</>
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
	loginState: selectLogin(state),
});

export default withRouter(connect(mapStateToProps)(Navigation));
