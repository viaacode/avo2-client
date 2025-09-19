import { Dropdown, type DropdownProps } from '@viaa/avo2-components';
import React, { useState } from 'react';

const ControlledDropdown = (props: DropdownProps) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	return (
		<Dropdown
			{...props}
			isOpen={isOpen}
			onClose={() => setIsOpen(false)}
			onOpen={() => setIsOpen(true)}
		/>
	);
};
