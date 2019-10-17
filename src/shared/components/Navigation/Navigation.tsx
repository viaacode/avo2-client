import React, { FunctionComponent } from 'react';
import { Link, NavLink } from 'react-router-dom';

import {
	Button,
	Container,
	Icon,
	Navbar,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';

import { IconName } from '../../../shared/types/types';

import './Navigation.scss';

type NavigationItem = {
	label: string;
	location: string;
	icon?: string;
};

export interface NavigationProps {
	primaryItems: NavigationItem[];
	secondaryItems: NavigationItem[];
	isOpen: boolean;
	handleMenuClick?: () => void;
}

export const Navigation: FunctionComponent<NavigationProps> = ({
	primaryItems,
	secondaryItems,
	isOpen,
	handleMenuClick = () => {},
}) => {
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
											{primaryItems.map(item => (
												<li key={`${item.location}-${item.label}`}>
													<NavLink
														to={item.location}
														className="c-nav__item c-nav__item--i"
														activeClassName="c-nav__item--active"
														exact={item.location === '/'}
													>
														{item.icon && <Icon name={item.icon as IconName} />}
														{item.label}
													</NavLink>
												</li>
											))}
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
											{secondaryItems.map(item => (
												<li key={`${item.location}-${item.label}`}>
													<NavLink
														to={item.location}
														className="c-nav__item c-nav__item--i"
														activeClassName="c-nav__item--active"
														exact={false}
													>
														{item.label}
													</NavLink>
												</li>
											))}
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
							{primaryItems.map(item => (
								<li key={`${item.location}-${item.label}`}>
									<NavLink
										to={item.location}
										className="c-nav-mobile__item"
										activeClassName="c-nav__item--active"
										exact={false}
									>
										{item.label}
										{item.icon && <Icon name={item.icon as IconName} />}
									</NavLink>
								</li>
							))}
						</ul>
						<ul className="c-nav-mobile">
							{secondaryItems.map(item => (
								<li key={`${item.location}-${item.label}`}>
									<NavLink
										to={item.location}
										className="c-nav-mobile__item"
										activeClassName="c-nav__item--active"
										exact={false}
									>
										{item.label}
									</NavLink>
								</li>
							))}
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
										{primaryItems.map(item => (
											<li key={`${item.location}-${item.label}`}>
												<NavLink
													to={item.location}
													activeClassName="c-nav__item--active"
													className="c-nav__item c-nav__item--i"
												>
													{item.icon && <Icon name={item.icon as IconName} />}
													{item.label}
												</NavLink>
											</li>
										))}
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
