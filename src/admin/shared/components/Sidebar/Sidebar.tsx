import classnames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import { NavigationItemInfo } from '../../../../shared/types';

import { Trans } from 'react-i18next';
import './Sidebar.scss';

interface SidebarProps extends RouteComponentProps {
	className?: string;
	headerLink?: string;
	light?: boolean;
	navItems?: NavigationItemInfo[];
}

const Sidebar: FunctionComponent<SidebarProps> = ({
	children,
	className,
	headerLink,
	light = false,
	navItems,
	location,
}) => {
	const isActiveClass = (item: NavigationItemInfo): boolean => {
		return (
			(!!item.location && item.location === location.pathname && !item.exact) ||
			(!!item.location &&
				item.location === location.pathname + location.search &&
				!!item.exact)
		);
	};

	return (
		<div className={classnames(className, 'o-sidebar', { 'o-sidebar--light': light })}>
			{headerLink && (
				<div className="o-sidebar__header">
					<Link className="u-remove-link-styling u-color-white" to={headerLink}>
						<Trans i18nKey="admin/shared/components/sidebar/sidebar___beheer">
							Beheer
						</Trans>
					</Link>
				</div>
			)}
			<div className="o-sidebar__content">
				{navItems ? (
					<ul className="o-sidebar__nav c-bordered-list">
						{navItems.map((navItem, index) => (
							<li
								key={`${navItem.location}-${index}`}
								className={classnames('o-sidebar__nav-item-wrapper', {
									'o-sidebar__nav-item-sublink': navItem.subLink || false,
								})}
							>
								<Link
									// activeClassName="o-sidebar__nav-item--active"
									className={classnames('o-sidebar__nav-item', {
										'o-sidebar__nav-item--active': isActiveClass(navItem),
									})}
									to={navItem.location as string}
								>
									{navItem.label}
								</Link>
							</li>
						))}
					</ul>
				) : (
					children
				)}
			</div>
		</div>
	);
};

export default withRouter(Sidebar);
