import React, { Fragment, FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

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
}: NavigationProps) => {
	return (
		<Fragment>
			<Navbar background="inverse" position="fixed" placement="top">
				<Container mode="horizontal">
					<Toolbar>
						<ToolbarLeft>
							<Fragment>
								<ToolbarItem>
									<h1 className="c-brand">
										<Link to="/">
											<img
												className="c-brand__image"
												src="/images/avo-logo-i.svg"
												alt="Archief voor Onderwijs"
											/>
										</Link>
									</h1>
								</ToolbarItem>
								<ToolbarItem>
									<div className="u-mq-switch-main-nav-has-space">
										<ul className="c-nav">
											{primaryItems.map(item => (
												<li
													className="c-nav__item c-nav__item--i"
													key={`${item.location}-${item.label}`}
												>
													<Link to={item.location}>
														{item.icon && <Icon name={item.icon} />}
														{item.label}
													</Link>
												</li>
											))}
										</ul>
									</div>
								</ToolbarItem>
							</Fragment>
						</ToolbarLeft>
						<ToolbarRight>
							<Fragment>
								<ToolbarItem>
									<div className="u-mq-switch-main-nav-authentication">
										<ul className="c-nav">
											{secondaryItems.map(item => (
												<li
													className="c-nav__item c-nav__item--i"
													key={`${item.location}-${item.label}`}
												>
													<Link to={item.location}>{item.label}</Link>
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
							</Fragment>
						</ToolbarRight>
					</Toolbar>
				</Container>
			</Navbar>
			{isOpen ? (
				<Container mode="horizontal">
					<Container mode="vertical">
						<ul className="c-nav-mobile">
							{primaryItems.map(item => (
								<li className="c-nav-mobile__item" key={`${item.location}-${item.label}`}>
									<Link to={item.location}>{item.label}</Link>
								</li>
							))}
						</ul>
						<ul className="c-nav-mobile">
							{secondaryItems.map(item => (
								<li className="c-nav-mobile__item" key={`${item.location}-${item.label}`}>
									<Link to={item.location}>{item.label}</Link>
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
											<li
												className="c-nav__item c-nav__item--i"
												key={`${item.location}-${item.label}`}
											>
												<Link to={item.location}>{item.label}</Link>
											</li>
										))}
									</ul>
								</div>
							</ToolbarLeft>
						</Toolbar>
					</Container>
				</Navbar>
			)}
		</Fragment>
	);
};
