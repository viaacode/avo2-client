import { mount, shallow } from 'enzyme';
import React from 'react';

import { action } from '@storybook/addon-actions';
import { DateRangeDropdown, DateRangeDropdownState } from './DateRangeDropdown';

describe('<Checkbox />', () => {
	it('Should be able to render', () => {
		shallow(
			<DateRangeDropdown
				label="Counting"
				id="counting"
				onChange={action('CheckboxDropdown changed')}
			/>
		);
	});

	it('Should be able to render with less than 10 items', () => {
		const checkboxDropdownComponent = shallow(
			<DateRangeDropdown
				label="Counting"
				id="counting"
				onChange={action('CheckboxDropdown changed')}
			/>
		);
		expect(checkboxDropdownComponent.find('Checkbox')).toHaveLength(5);
	});

	it('Should be able to render with default collapsedItemCount of 10', () => {
		const checkboxDropdownComponent = shallow(
			<DateRangeDropdown
				label="Counting"
				id="counting"
				onChange={action('CheckboxDropdown changed')}
			/>
		);
		expect(checkboxDropdownComponent.find('Checkbox')).toHaveLength(10);

		checkboxDropdownComponent.find('.c-link-toggle').simulate('click');

		expect(checkboxDropdownComponent.find('Checkbox')).toHaveLength(12);

		checkboxDropdownComponent.find('.c-link-toggle').simulate('click');

		expect(checkboxDropdownComponent.find('Checkbox')).toHaveLength(10);
	});

	it('Should be able to render with custom collapsedItemCount of 6', () => {
		const checkboxDropdownComponent = shallow(
			<DateRangeDropdown
				label="Counting"
				id="counting"
				onChange={action('CheckboxDropdown changed')}
			/>
		);
		expect(checkboxDropdownComponent.find('Checkbox')).toHaveLength(6);

		checkboxDropdownComponent.find('.c-link-toggle').simulate('click');

		expect(checkboxDropdownComponent.find('Checkbox')).toHaveLength(12);

		checkboxDropdownComponent.find('.c-link-toggle').simulate('click');

		expect(checkboxDropdownComponent.find('Checkbox')).toHaveLength(6);
	});

	it('Should call `onChange` when toggling checkbox', () => {
		const onChangeHandler = jest.fn();

		const checkboxDropdownComponent = mount(
			<DateRangeDropdown label="Counting" id="counting" onChange={onChangeHandler} />
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

		const checkboxes = checkboxDropdownComponent.find('[type="checkbox"]');

		checkboxes.at(2).simulate('change', { target: { checked: true } });

		expect((checkboxDropdownComponent.state() as DateRangeDropdownState).range).toMatchObject({
			...defaultState,
			three: true,
		});

		checkboxes.at(3).simulate('change', { target: { checked: true } });

		expect((checkboxDropdownComponent.state() as DateRangeDropdownState).range).toMatchObject({
			...defaultState,
			three: true,
			four: true,
		});

		checkboxes.at(2).simulate('change', { target: { checked: false } });

		expect((checkboxDropdownComponent.state() as DateRangeDropdownState).range).toMatchObject({
			...defaultState,
			four: true,
		});
	});
});
