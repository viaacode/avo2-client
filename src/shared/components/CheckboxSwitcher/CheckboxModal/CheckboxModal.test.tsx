import { mount, shallow } from 'enzyme';
import React from 'react';

import { action } from '@storybook/addon-actions';
import { CheckboxModal, CheckboxModalState } from './CheckboxModal';

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
			<CheckboxModal
				label="Counting"
				id="counting"
				options={countOptions}
				onChange={action('CheckboxModal changed')}
			/>
		);
	});

	it('Should be able to render with less than 10 items', () => {
		const CheckboxModalComponent = shallow(
			<CheckboxModal
				label="Counting"
				id="counting"
				options={countOptions.slice(0, 5)}
				onChange={action('CheckboxModal changed')}
			/>
		);
		expect(CheckboxModalComponent.find('Checkbox')).toHaveLength(5);
	});

	it('Should call `onChange` when toggling checkbox', () => {
		const onChangeHandler = jest.fn();

		const CheckboxModalComponent = mount(
			<CheckboxModal
				label="Counting"
				id="counting"
				options={countOptions}
				onChange={onChangeHandler}
			/>
		);

		const defaultState = {
			one: false,
			two: false,
			three: false,
			four: false,
			five: false,
			six: false,
			seven: false,
			eight: false,
			nine: false,
			ten: false,
			elven: false,
			twelve: false,
		};

		const checkboxes = CheckboxModalComponent.find('[type="checkbox"]');

		checkboxes.at(2).simulate('change', { target: { checked: true } });

		expect((CheckboxModalComponent.state() as CheckboxModalState).checkedStates).toMatchObject({
			...defaultState,
			three: true,
		});

		checkboxes.at(3).simulate('change', { target: { checked: true } });

		expect((CheckboxModalComponent.state() as CheckboxModalState).checkedStates).toMatchObject({
			...defaultState,
			three: true,
			four: true,
		});

		checkboxes.at(2).simulate('change', { target: { checked: false } });

		expect((CheckboxModalComponent.state() as CheckboxModalState).checkedStates).toMatchObject({
			...defaultState,
			four: true,
		});
	});
});
