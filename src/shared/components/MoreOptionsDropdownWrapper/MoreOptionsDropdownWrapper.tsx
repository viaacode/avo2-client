import { Button, type IconName, MoreOptionsDropdown } from '@viaa/avo2-components';
import React, { type FC } from 'react';

type MoreOptionsDropdownWrapperProps = React.ComponentProps<typeof MoreOptionsDropdown>;

export const MoreOptionsDropdownWrapper: FC<MoreOptionsDropdownWrapperProps> = (props) => {
	const { menuItems, onOptionClicked } = props;
	if (menuItems.length === 0) {
		return null;
	}

	if (menuItems.length > 1) {
		return <MoreOptionsDropdown {...props} />;
	}

	const singleButton = menuItems[0] as {
		id: string;
		key: string;
		label: string;
		icon: IconName;
	};

	return (
		<Button
			type="secondary"
			title={singleButton.label}
			ariaLabel={singleButton.label}
			icon={singleButton.icon}
			onClick={() => onOptionClicked?.(singleButton.id)}
		/>
	);
};
