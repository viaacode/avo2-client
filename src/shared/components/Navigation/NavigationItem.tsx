import { Dropdown, DropdownButton, DropdownContent, Icon } from '@viaa/avo2-components';
import clsx from 'clsx';
import { noop } from 'lodash-es';
import React, { type FC } from 'react';
import { NavLink } from 'react-router-dom';

import { type BooleanDictionary } from '../../helpers/navigation';
import { type NavigationItemInfo } from '../../types';

import './Navigation.scss';

interface NavigationItemProps {
	item: NavigationItemInfo;
	className: string;
	showActive: boolean;
	isMobile?: boolean;
	areDropdownsOpen: BooleanDictionary;
	setDropdownsOpen: (areDropdownsOpen: BooleanDictionary) => void;
	onNavigate?: () => void;
}

export const NavigationItem: FC<NavigationItemProps> = ({
	item,
	className,
	showActive,
	isMobile = false,
	areDropdownsOpen,
	setDropdownsOpen,
	onNavigate = noop,
}) => {
	const setDropdownOpen = (
		label: string,
		isOpen: boolean,
		areDropdownsOpen: BooleanDictionary,
		setDropdownsOpen: (areDropdownsOpen: BooleanDictionary) => void
	): void => {
		const openStates = { ...areDropdownsOpen };
		openStates[label] = isOpen;
		setDropdownsOpen(openStates);
	};

	return (
		<li key={item.key} className={isMobile ? 'c-nav-mobile__item' : ''} onClick={onNavigate}>
			{!!item.location && !item.location.includes('//') && (
				<NavLink
					to={item.location}
					className={({ isActive }) =>
						clsx(className, isActive && showActive ? 'c-nav__item--active' : undefined)
					}
					title={item.tooltip}
				>
					{item.icon && !isMobile && <Icon name={item.icon} />}
					{item.label && <span className="c-nav__item-label">{item.label}</span>}
					{item.icon && isMobile && <Icon name={item.icon} />}
				</NavLink>
			)}
			{!!item.location && item.location.includes('//') && (
				<a href={item.location} className={className} target={item.target || '_blank'}>
					{item.icon && <Icon name={item.icon} />}
					<span className="c-nav__item-label">{item.label}</span>
				</a>
			)}
			{!!item.component && (
				<Dropdown
					menuWidth="fit-content"
					placement="bottom-end"
					isOpen={areDropdownsOpen[item.key] || false}
					onOpen={() =>
						setDropdownOpen(item.key, true, areDropdownsOpen, setDropdownsOpen)
					}
					onClose={() =>
						setDropdownOpen(item.key, false, areDropdownsOpen, setDropdownsOpen)
					}
				>
					<DropdownButton>
						<div className={`${className} u-clickable`}>
							{item.icon && <Icon name={item.icon} />}
							<div className="c-nav__item-label">{item.label}</div>
						</div>
					</DropdownButton>
					<DropdownContent>
						{React.cloneElement(item.component, {
							closeDropdown: () =>
								setDropdownOpen(
									item.key,
									false,
									areDropdownsOpen,
									setDropdownsOpen
								),
						})}
					</DropdownContent>
				</Dropdown>
			)}
		</li>
	);
};
