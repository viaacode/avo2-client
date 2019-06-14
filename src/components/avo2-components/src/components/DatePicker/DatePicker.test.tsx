import { shallow } from 'enzyme';
import React from 'react';

import { DatePicker } from './DatePicker';

describe('<DatePicker />', () => {
	it('Should be able to render', () => {
		shallow(<DatePicker />);
	});

	it('Should set the correct className', () => {
		const datePickerComponent = shallow(<DatePicker />);

		const datePickerElement = datePickerComponent.find('input');

		expect(datePickerElement.hasClass('c-input')).toEqual(true);
	});

	it('Should pass on the id', () => {
		const id = 'test';

		const datePickerComponent = shallow(<DatePicker id={id} />);

		const datePickerElement = datePickerComponent.find('input');

		expect(datePickerElement.prop('id')).toEqual(id);
	});

	it('Should be able to set the disabled state', () => {
		const datePickerComponent = shallow(<DatePicker disabled />);

		const datePickerElement = datePickerComponent.find('input');

		expect(datePickerElement.prop('disabled')).toEqual(true);
	});

	it('Should be able to set an initial value', () => {
		const defaultDateString = '2019-06-11';
		const defaultDateObject = new Date(defaultDateString);

		const datePickerComponent = shallow(<DatePicker defaultValue={defaultDateObject} />);

		const datePickerElement = datePickerComponent.find('input');

		expect(datePickerElement.prop('value')).toEqual(defaultDateString);
	});

	it('Should be able to set a placeholder value', () => {
		const placeholder = 'dd-mm-yyyy';

		const datePickerComponent = shallow(<DatePicker placeholder={placeholder} />);

		const datePickerElement = datePickerComponent.find('input');

		expect(datePickerElement.prop('placeholder')).toEqual(placeholder);
	});

	it('Should call the onChange handler when the input changes', () => {
		const onChangeHandler = jest.fn();

		const datePickerComponent = shallow(<DatePicker onChange={onChangeHandler} />);

		const datePickerElement = datePickerComponent.find('input');

		const dateObject1 = new Date('2019-06-11');
		const dateObject2 = new Date('2018-05-10');

		datePickerElement.simulate('change', { target: { value: dateObject1 } });

		expect(onChangeHandler).toHaveBeenCalled();
		expect(onChangeHandler).toHaveBeenCalledTimes(1);
		expect(onChangeHandler).toHaveBeenCalledWith(dateObject1);

		datePickerElement.simulate('change', { target: { value: dateObject2 } });

		expect(onChangeHandler).toHaveBeenCalledTimes(2);
		expect(onChangeHandler).toHaveBeenCalledWith(dateObject2);
	});
});
