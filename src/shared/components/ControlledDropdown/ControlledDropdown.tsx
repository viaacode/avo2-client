import React, { useState } from 'react';

import { Dropdown, DropdownProps } from '@viaa/avo2-components';

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

export default ControlledDropdown;
