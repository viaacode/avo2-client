import classnames from 'classnames';
import { Location } from 'history';
import { flatten } from 'lodash-es';
import React, { FunctionComponent, ReactElement } from 'react';
import { Trans } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';

import { NavigationItemInfo } from '../../../../shared/types';

import './Sidebar.scss';

interface SidebarProps {
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
}) => {
	const isActiveClass = (item: NavigationItemInfo, location: Location): boolean => {
		return (
			(!!item.location && item.location === location.pathname && !item.exact) ||
			(!!item.location &&
				item.location === location.pathname + location.search &&
				!!item.exact)
		);
	};

	const renderNavigationItem = (
		navItem: NavigationItemInfo,
		index: number | string,
		isSubLink: boolean
	): ReactElement => {
		return (
			<li
				key={`${navItem.location}-${index}`}
				className={classnames('o-sidebar__nav-item-wrapper', {
					'o-sidebar__nav-item-sublink': isSubLink || false,
				})}
			>
				<NavLink
					className={classnames('o-sidebar__nav-item')}
					activeClassName="o-sidebar__nav-item--active"
					// @ts-ignore
					isActive={(match, location) => isActiveClass(navItem, location)}
					to={navItem.location as string}
				>
					{navItem.label}
				</NavLink>
			</li>
		);
	};

	const renderNavItems = () => {
		const renderedNavItems: ReactElement[] = flatten(
			(navItems || []).map((navItem, itemIndex): ReactElement[] => [
				renderNavigationItem(navItem, itemIndex, false),
				...(navItem.subLinks || []).map((subLinkItem: NavigationItemInfo, subItemIndex) => {
					return renderNavigationItem(subLinkItem, `${itemIndex}-${subItemIndex}`, true);
				}),
			])
		);
		return <>{renderedNavItems}</>;
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
					<ul className="o-sidebar__nav c-bordered-list">{renderNavItems()}</ul>
				) : (
					children
				)}
			</div>
		</div>
	);
};

export default Sidebar;
