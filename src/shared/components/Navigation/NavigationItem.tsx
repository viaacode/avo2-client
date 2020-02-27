import React, { FunctionComponent } from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';

import { Dropdown, DropdownButton, DropdownContent, Icon } from '@viaa/avo2-components';

import { BooleanDictionary } from '../../helpers/navigation';
import { NavigationItemInfo } from '../../types';

import './Navigation.scss';

export interface NavigationItemProps extends RouteComponentProps {
	item: NavigationItemInfo;
	className: string;
	exact: boolean;
	showActive: boolean;
	areDropdownsOpen: BooleanDictionary;
	setDropdownsOpen: (areDropdownsOpen: BooleanDictionary) => void;
}

export const NavigationItem: FunctionComponent<NavigationItemProps> = ({
	item,
	className,
	exact,
	showActive,
	areDropdownsOpen,
	setDropdownsOpen,
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
		<li key={item.key}>
			{!!item.location && !item.location.includes('//') && (
				<NavLink
					to={item.location}
					className={className}
					activeClassName={showActive ? 'c-nav__item--active' : undefined}
					exact={exact}
				>
					{item.icon && <Icon name={item.icon} />}
					{item.label}
				</NavLink>
			)}
			{!!item.location && item.location.includes('//') && (
				<a href={item.location} className={className} target={item.target || '_blank'}>
					{item.icon && <Icon name={item.icon} />}
					{item.label}
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
							{item.label}
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

export default NavigationItem;
