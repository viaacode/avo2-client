import { shallow } from 'enzyme';
import React from 'react';

import { Checkbox } from './Checkbox';

describe('<Checkbox />', () => {
	it('Should be able to render', () => {
		shallow(<Checkbox label="One" checked={false} />);
	});

	it('Should set the correct className', () => {
		const checkboxComponent = shallow(<Checkbox label="One" checked={false} />);

		expect(checkboxComponent.hasClass('c-checkbox')).toEqual(true);
	});

	it('Should correctly render `label`', () => {
		const checkboxComponent = shallow(<Checkbox label="One" checked={false} />);

		expect(checkboxComponent.find('label').html()).toContain('One');
	});

	it('Should correctly render `checked state`', () => {
		const checkedCheckboxComponent = shallow(<Checkbox label="One" checked={true} />);
		const uncheckedCheckboxComponent = shallow(<Checkbox label="Two" checked={false} />);

		expect(checkedCheckboxComponent.find('input').prop('checked')).toEqual(true);
		expect(uncheckedCheckboxComponent.find('input').prop('checked')).toEqual(false);
	});

	it('Should correctly render `id`', () => {
		const id = 'test';

		const checkboxComponent = shallow(<Checkbox label="One" checked={false} id={id} />);

		expect(checkboxComponent.find('[type="checkbox"]').prop('id')).toEqual(id);
	});

	it('Should be able to render without `id`', () => {
		const checkboxComponent = shallow(<Checkbox label="One" checked={false} />);

		expect(checkboxComponent.find('[type="checkbox"]').prop('id')).toEqual(undefined);
	});

	it('Should be able to set the disabled state', () => {
		const checkboxComponent = shallow(<Checkbox label="One" checked={false} disabled />);

		expect(checkboxComponent.find('input').prop('disabled')).toEqual(true);
	});

	it('Should call `onChange` when toggling checkbox', () => {
		const onChangeHandler = jest.fn();

		const checkboxComponent = shallow(
			<Checkbox label="One" checked={false} id="one" onChange={onChangeHandler} />
		);

		const checkboxElement = checkboxComponent.find('[type="checkbox"]');

		checkboxElement.simulate('change', { target: { checked: true } });

		expect(onChangeHandler).toHaveBeenCalled();
		expect(onChangeHandler).toHaveBeenCalledTimes(1);
		expect(onChangeHandler).toHaveBeenCalledWith(true);
	});
});
