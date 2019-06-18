import { mount, shallow } from 'enzyme';
import React from 'react';

import { RadioButton } from '../..';
import { RadioButtonGroup } from './RadioButtonGroup';

describe('<RadioButtonGroup />', () => {
	it('Should be able to render', () => {
		shallow(
			<RadioButtonGroup>
				<RadioButton name="List1" label="Fish" value="fish" />
				<RadioButton name="List1" label="Steak" value="steak" />
				<RadioButton name="List1" label="Bacon" value="bacon" />
			</RadioButtonGroup>
		);
	});

	it('Should set the correct className', () => {
		const radioButtonGroupComponent = shallow(
			<RadioButtonGroup>
				<RadioButton name="List2" label="Fish" value="fish" />
				<RadioButton name="List2" label="Steak" value="steak" />
				<RadioButton name="List2" label="Bacon" value="bacon" />
			</RadioButtonGroup>
		);

		expect(radioButtonGroupComponent.hasClass('c-radio-group')).toEqual(true);
	});

	it('Should set the correct inline className', () => {
		const radioButtonGroupComponent = shallow(
			<RadioButtonGroup inline>
				<RadioButton name="List2" label="Fish" value="fish" />
				<RadioButton name="List2" label="Steak" value="steak" />
				<RadioButton name="List2" label="Bacon" value="bacon" />
			</RadioButtonGroup>
		);

		expect(radioButtonGroupComponent.hasClass('c-radio-group--inline')).toEqual(true);
	});

	it('Should correctly pass children', () => {
		const radioButtonGroupComponent = mount(
			<RadioButtonGroup>
				<RadioButton name="List3" label="Fish" value="fish" />
				<RadioButton name="List3" label="Steak" value="steak" />
				<RadioButton name="List3" label="Bacon" value="bacon" />
			</RadioButtonGroup>
		);

		const radioButtons = radioButtonGroupComponent.find('[type="radio"]');

		expect(radioButtons).toHaveLength(3);
	});
});
