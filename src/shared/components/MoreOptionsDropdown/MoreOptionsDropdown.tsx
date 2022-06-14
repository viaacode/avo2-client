import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	Dropdown,
	DropdownButton,
	DropdownContent,
	MenuContent,
} from '@viaa/avo2-components';
import { MenuItemInfoSchema } from '@viaa/avo2-components/src/components/Menu/MenuContent/MenuContent';

export interface MoreOptionsDropdownProps {
	isOpen: boolean;
	onClose?: () => void;
	onOpen?: () => void;
	menuItems: MenuItemInfoSchema[] | MenuItemInfoSchema[][];
	onOptionClicked?: (menuItemId: string | number) => void;
	disabled?: boolean;
}

const MoreOptionsDropdown: FunctionComponent<MoreOptionsDropdownProps> = ({
	isOpen,
	onOpen,
	onClose,
	menuItems,
	onOptionClicked,
	disabled,
}) => {
	const [t] = useTranslation();

	return (
		<Dropdown
			isOpen={isOpen}
			menuWidth="fit-content"
			onOpen={onOpen}
			onClose={onClose}
			placement="bottom-end"
		>
			<DropdownButton>
				<Button
					disabled={disabled}
					icon="more-horizontal"
					type="secondary"
					ariaLabel={t('assignment/views/assignment-detail___meer-opties')}
					title={t('assignment/views/assignment-detail___meer-opties')}
				/>
			</DropdownButton>
			<DropdownContent>
				{!!menuItems && !!menuItems.length && (
					<MenuContent menuItems={menuItems} onClick={onOptionClicked} />
				)}
			</DropdownContent>
		</Dropdown>
	);
};

export default MoreOptionsDropdown;
