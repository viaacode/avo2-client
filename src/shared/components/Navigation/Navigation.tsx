import React, { FunctionComponent, useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import {
	Button,
	Container,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Icon,
	Navbar,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';

import { NavigationItem } from '../../types';

import './Navigation.scss';

export interface NavigationProps {
	primaryItems: NavigationItem[];
	secondaryItems: NavigationItem[];
	isOpen: boolean;
	handleMenuClick?: () => void;
}

const Navigation: FunctionComponent<NavigationProps> = ({
	primaryItems,
	secondaryItems,
	isOpen,
	handleMenuClick = () => {},
}) => {
	const [areDropdownsOpen, setDropdownsOpen] = useState<{ [label: string]: boolean }>({});

	useEffect(() => {
		// Init areDropdownsOpen for all navigation items to false
		// otherwise for some reason the dropdown starts in the open state
		const openStates = { ...areDropdownsOpen };
		setDropdownsOpen(openStates);
		primaryItems.forEach(item => (openStates[item.label] = false));
		secondaryItems.forEach(item => (openStates[item.label] = false));
		setDropdownsOpen(openStates);
	}, []);

	const setDropdownOpen = (label: string, isOpen: boolean): void => {
		const openStates = { ...areDropdownsOpen };
		openStates[label] = isOpen;
		setDropdownsOpen(openStates);
	};

	const renderNavLinkItem = (item: NavigationItem, className: string, exact: boolean) => {
		return (
			<li key={`${item.location}-${item.label}`}>
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
						isOpen={areDropdownsOpen[item.label]}
						onOpen={() => setDropdownOpen(item.label, true)}
						onClose={() => setDropdownOpen(item.label, false)}
					>
						<DropdownButton>
							<div className={`${className} u-clickable`}>
								{item.icon && <Icon name={item.icon} />}
								{item.label}
							</div>
						</DropdownButton>
						<DropdownContent>
							{React.cloneElement(item.component, {
								closeDropdown: () => setDropdownOpen(item.label, false),
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
											{primaryItems.map(item =>
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
											{secondaryItems.map(item =>
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
											onClick={handleMenuClick}
										/>
									</div>
								</ToolbarItem>
							</>
						</ToolbarRight>
					</Toolbar>
				</Container>
			</Navbar>
			{isOpen ? (
				<Container mode="horizontal">
					<Container mode="vertical">
						<ul className="c-nav-mobile">
							{primaryItems.map(item =>
								renderNavLinkItem(item, 'c-nav-mobile__item', item.location === '/')
							)}
						</ul>
						<ul className="c-nav-mobile">
							{secondaryItems.map(item => renderNavLinkItem(item, 'c-nav-mobile__item', false))}
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
										{primaryItems.map(item =>
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

export default Navigation;
