import React, { FunctionComponent } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { NavigationItem } from '../../../../shared/types';

import './Sidebar.scss';

interface SidebarProps {
	headerLink: string;
	navItems: NavigationItem[];
}

const Sidebar: FunctionComponent<SidebarProps> = ({ headerLink, navItems }) => (
	<div className="o-sidebar">
		<div className="o-sidebar__header">
			<Link className="u-remove-link-styling u-color-white" to={headerLink}>
				Beheer
			</Link>
		</div>
		<div className="o-sidebar__content">
			<ul className="o-sidebar__nav c-bordered-list">
				{navItems.map((navItem, index) => (
					<li key={`${navItem.location}-${index}`}>
						<NavLink
							activeClassName="o-sidebar__nav-item--active"
							className="o-sidebar__nav-item"
							to={navItem.location}
						>
							{navItem.label}
						</NavLink>
					</li>
				))}
			</ul>
		</div>
	</div>
);

export default Sidebar;
