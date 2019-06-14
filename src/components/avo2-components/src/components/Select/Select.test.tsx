import { shallow } from 'enzyme';
import React from 'react';

import { Select } from './Select';

const options = [
	{ label: 'Aluminium', value: 'Al' },
	{ label: 'Cadmium', value: 'Cd' },
	{ label: 'Dubnium', value: 'Db' },
	{ label: 'Potassium', value: 'K' },
	{ label: 'Vanadium', value: 'V' },
	{ label: 'Palladium', value: 'Pd' },
	{ label: 'Polonium', value: 'Po' },
	{ label: 'Rhodium', value: 'Rh' },
	{ label: 'Yttrium', value: 'Y' },
	{ label: 'Uranium', value: 'U' },
];

describe('<Select />', () => {
	it('Should be able to render', () => {
		shallow(<Select options={options} />);
	});

	it('Should set the correct className', () => {
		const selectComponent = shallow(<Select options={options} />);

		const selectWrapper = selectComponent.at(0);
		const selectElement = selectComponent.find('select');

		expect(selectWrapper.hasClass('c-select-holder')).toEqual(true);
		expect(selectElement.hasClass('c-select')).toEqual(true);
	});

	it('Should correctly render the given options', () => {
		const selectComponent = shallow(<Select options={options} />);

		const optionElements = selectComponent.find('option');

		optionElements.forEach((optionElement, index) => {
			expect(optionElement.prop('value')).toEqual(options[index].value);
			expect(optionElement.text()).toEqual(options[index].label);
		});
	});

	it('Should pass on the id', () => {
		const id = 'test';

		const selectComponent = shallow(<Select options={options} id={id} />);

		const selectElement = selectComponent.find('select');

		expect(selectElement.prop('id')).toEqual(id);
	});

	it('Should be able to set the disabled state', () => {
		const selectComponent = shallow(<Select options={options} disabled />);

		const selectElement = selectComponent.find('select');

		expect(selectElement.prop('disabled')).toEqual(true);
	});

	it('Should be able to set an initial value', () => {
		const defaultValue = options[5].value;

		const selectComponent = shallow(<Select options={options} defaultValue={defaultValue} />);

		const selectElement = selectComponent.find('select');

		expect(selectElement.prop('value')).toEqual(defaultValue);
	});

	it('Should call the onChange handler when the select option changes', () => {
		const onChangeHandler = jest.fn();

		const selectComponent = shallow(<Select options={options} onChange={onChangeHandler} />);

		const selectElement = selectComponent.find('select');

		selectElement.simulate('change', { target: { value: options[3] } });

		expect(onChangeHandler).toHaveBeenCalled();
		expect(onChangeHandler).toHaveBeenCalledTimes(1);
		expect(onChangeHandler).toHaveBeenCalledWith(options[3]);

		selectElement.simulate('change', { target: { value: options[6] } });

		expect(onChangeHandler).toHaveBeenCalledTimes(2);
		expect(onChangeHandler).toHaveBeenCalledWith(options[6]);
	});
});
