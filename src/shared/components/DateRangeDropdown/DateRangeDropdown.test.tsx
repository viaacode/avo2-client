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
				range={{ gte: '', lte: '' }}
				onChange={action('CheckboxDropdown changed')}
			/>
		);
	});

	it('Should call `onChange` when changing a datetime', () => {
		const onChangeHandler = jest.fn();

		const dateTimePickerComponent = mount(
			<DateRangeDropdown label="releaseDate" id="releaseDate" onChange={onChangeHandler} />
		);

		const yearInputs = dateTimePickerComponent.find('[placeholder="JJJJ"]');

		yearInputs.at(1).simulate('change', { target: { value: '2018' } });
		yearInputs.at(2).simulate('change', { target: { value: '2019' } });

		dateTimePickerComponent.find('.c-button.c-button--block.c-button--primary').simulate('click');

		expect(onChangeHandler).toBeCalled();
		expect(onChangeHandler).toBeCalledWith(
			{
				gte: '2018-01-01',
				lte: '2019-12-31',
			},
			'releaseDate'
		);
	});
});
