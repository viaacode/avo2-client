import classnames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { NavigationItemInfo } from '../../../../shared/types';

import { Trans } from 'react-i18next';
import './Sidebar.scss';

interface SidebarProps {
	className?: string;
	headerLink?: string;
	light?: boolean;
	navItems?: NavigationItemInfo[];
}

export const Sidebar: FunctionComponent<SidebarProps> = ({
	children,
	className,
	headerLink,
	light = false,
	navItems,
}) => (
	<div className={classnames(className, 'o-sidebar', { 'o-sidebar--light': light })}>
		{headerLink && (
			<div className="o-sidebar__header">
				<Link className="u-remove-link-styling u-color-white" to={headerLink}>
					<Trans i18nKey="admin/shared/components/sidebar/sidebar___beheer">Beheer</Trans>
				</Link>
			</div>
		)}
		<div className="o-sidebar__content">
			{navItems ? (
				<ul className="o-sidebar__nav c-bordered-list">
					{navItems.map((navItem, index) => (
						<li key={`${navItem.location}-${index}`} className="o-sidebar__nav-item-wrapper">
							<NavLink
								activeClassName="o-sidebar__nav-item--active"
								className="o-sidebar__nav-item"
								to={navItem.location as string}
							>
								{navItem.label}
							</NavLink>
						</li>
					))}
				</ul>
			) : (
				children
			)}
		</div>
	</div>
);
