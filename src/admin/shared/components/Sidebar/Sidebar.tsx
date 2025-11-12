import { Icon, IconName } from '@viaa/avo2-components';
import { clsx } from 'clsx';
import { flatten } from 'es-toolkit';
import React, { type FC, type ReactElement, type ReactNode } from 'react';
import { Link, type Location, NavLink, useLocation } from 'react-router-dom';

import { APP_PATH } from '../../../../constants.js';
import { CustomError } from '../../../../shared/helpers/custom-error.js';
import { tHtml } from '../../../../shared/helpers/translate-html.js';
import { tText } from '../../../../shared/helpers/translate-text.js';
import { type NavigationItemInfo } from '../../../../shared/types/index.js';

import './Sidebar.scss';

interface SidebarProps {
	children?: ReactNode;
	className?: string;
	headerLink?: string;
	light?: boolean;
	navItems?: NavigationItemInfo[];
}

export const Sidebar: FC<SidebarProps> = ({
	children,
	className,
	headerLink,
	light = false,
	navItems,
}) => {
	const location = useLocation();

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
		if (!navItem.location) {
			console.error(
				new CustomError(
					'Failed to correctly render navigation item because location is undefined',
					null,
					{ navItem, index, isSubLink }
				)
			);
		}
		return (
			<li
				key={`${navItem.location}-${index}`}
				className={clsx('o-sidebar__avo__nav-item-wrapper', {
					'o-sidebar__avo__nav-item-sublink': isSubLink || false,
				})}
			>
				<NavLink
					className={clsx(
						'o-sidebar__avo__nav-item',
						isActiveClass(navItem, location)
							? 'o-sidebar__avo__nav-item--active'
							: undefined
					)}
					to={navItem.location || '/'}
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
		<div className={clsx(className, 'o-sidebar__avo', { 'o-sidebar__avo--light': light })}>
			{headerLink && (
				<div className="o-sidebar__avo__header">
					<Link
						className="u-remove-link-styling u-color-white o-sidebar__avo__header__admin-home"
						to={headerLink}
					>
						{tHtml('admin/shared/components/sidebar/sidebar___beheer')}
					</Link>
					<Link
						className="u-remove-link-styling u-color-white o-sidebar__avo__header__side-link"
						to={APP_PATH.HOME.route}
					>
						<span title={tText('admin/shared/components/sidebar/sidebar___homepagina')}>
							<Icon name={IconName.home} />
						</span>
					</Link>
					<Link
						className="u-remove-link-styling u-color-white o-sidebar__avo__header__side-link"
						to={APP_PATH.LOGOUT.route}
					>
						<span title={tText('admin/shared/components/sidebar/sidebar___uitloggen')}>
							<Icon name={IconName.logOut} />
						</span>
					</Link>
				</div>
			)}
			<div className="o-sidebar__avo__content">
				{navItems ? (
					<ul className="o-sidebar__avo__nav c-bordered-list">{renderNavItems()}</ul>
				) : (
					children
				)}
			</div>
		</div>
	);
};
