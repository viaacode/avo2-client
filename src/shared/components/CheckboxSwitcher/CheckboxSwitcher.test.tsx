import { mount, shallow } from 'enzyme';
import React from 'react';

import { action } from '@storybook/addon-actions';
import { CheckboxSwitcher } from './CheckboxSwitcher';

const countOptions = [
	{
		label: 'One',
		id: 'one',
		checked: false,
	},
	{
		label: 'Two',
		id: 'two',
		checked: false,
	},
	{
		label: 'Three',
		id: 'three',
		checked: false,
	},
	{
		label: 'Four',
		id: 'four',
		checked: false,
	},
	{
		label: 'Five',
		id: 'five',
		checked: false,
	},
	{
		label: 'Six',
		id: 'six',
		checked: false,
	},
	{
		label: 'Seven',
		id: 'seven',
		checked: false,
	},
	{
		label: 'Eight',
		id: 'eight',
		checked: false,
	},
	{
		label: 'Nine',
		id: 'nine',
		checked: false,
	},
	{
		label: 'Ten',
		id: 'ten',
		checked: false,
	},
	{
		label: 'Elven',
		id: 'elven',
		checked: false,
	},
	{
		label: 'Twelve',
		id: 'twelve',
		checked: false,
	},
];

describe('<Checkbox />', () => {
	it('Should be able to render', () => {
		shallow(
			<CheckboxSwitcher
				label="Counting"
				id="counting"
				options={countOptions}
				onChange={action('CheckboxSwitcher changed')}
			/>
		);
	});

	it('Should render a CheckboxDropdown when less than 7 options are passed', () => {
		const CheckboxSwitcherComponent = mount(
			<CheckboxSwitcher
				label="Counting"
				id="counting"
				options={countOptions.slice(0, 5)}
				onChange={action('CheckboxSwitcher changed')}
			/>
		);
		expect(CheckboxSwitcherComponent.find('.c-menu')).toHaveLength(1);
	});

	it('Should render a CheckboxModal when more than 7 options are passed', () => {
		const CheckboxSwitcherComponent = mount(
			<CheckboxSwitcher
				label="Counting"
				id="counting"
				options={countOptions}
				onChange={action('CheckboxSwitcher changed')}
			/>
		);
		expect(CheckboxSwitcherComponent.find('.c-menu')).toHaveLength(1);
	});
});
