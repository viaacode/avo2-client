import React, { useState } from 'react';

import { Dropdown } from '@viaa/avo2-components';
import { DropdownProps } from '@viaa/avo2-components/dist/components/Dropdown/Dropdown';

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
