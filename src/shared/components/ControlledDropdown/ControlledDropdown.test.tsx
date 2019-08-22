import React from 'react';

import { shallow } from 'enzyme';

import { DropdownButton, DropdownContent } from '@viaa/avo2-components';
import ControlledDropdown from './ControlledDropdown';

describe('<ControlledDropdown />', () => {
	const controlledDropdown = (
		<ControlledDropdown isOpen={false}>
			<DropdownButton>
				<button type="button">Click me</button>
			</DropdownButton>
			<DropdownContent>
				<p>Content</p>
			</DropdownContent>
		</ControlledDropdown>
	);

	it('should render', () => {
		shallow(controlledDropdown);
	});
});
