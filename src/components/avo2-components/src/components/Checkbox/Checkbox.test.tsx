import { shallow } from 'enzyme';
import React from 'react';

import { Checkbox } from './Checkbox';

describe('<Checkbox />', () => {
	it('Should be able to render', () => {
		shallow(<Checkbox label="One" id="one" />);
	});

	it('Should set the correct className', () => {
		const checkboxComponent = shallow(<Checkbox label="One" id="one" />);

		expect(checkboxComponent.hasClass('c-checkbox')).toEqual(true);
	});

	it('Should be able to render with id correctly set', () => {
		const checkboxComponent = shallow(<Checkbox label="One" id="one" />);

		expect(checkboxComponent.find('[type="checkbox"]').prop('id')).toEqual('one');
	});

	it('Should be able to render with label correctly set', () => {
		const checkboxComponent = shallow(<Checkbox label="One" id="one" />);

		expect(checkboxComponent.find('label').html()).toContain('One');
	});

	it('Should be able to render without an id', () => {
		const checkboxComponent = shallow(<Checkbox label="One" />);

		expect(checkboxComponent.find('[type="checkbox"]').prop('id')).toEqual(undefined);
	});

	it('Should set the defaultChecked-prop as the initial state', () => {
		const checkboxComponentTrue = shallow(<Checkbox label="One" id="one" defaultChecked={true} />);
		const checkboxComponentFalse = shallow(
			<Checkbox label="One" id="one" defaultChecked={false} />
		);

		expect(checkboxComponentTrue.find('[type="checkbox"]').prop('checked')).toEqual(true);
		expect(checkboxComponentFalse.find('[type="checkbox"]').prop('checked')).toEqual(false);
	});

	it('Should have a default value of false for the checked-state', () => {
		const checkboxComponent = shallow(<Checkbox label="One" id="one" />);

		expect(checkboxComponent.find('[type="checkbox"]').prop('checked')).toEqual(false);
	});

	it('Should call `onChange` when toggling checkbox', () => {
		const onChangeHandler = jest.fn();

		const checkboxComponent = shallow(<Checkbox label="One" id="one" onChange={onChangeHandler} />);

		const checkboxElement = checkboxComponent.find('[type="checkbox"]');

		checkboxElement.simulate('change', { target: { checked: true } });

		expect(onChangeHandler).toHaveBeenCalled();
		expect(onChangeHandler).toHaveBeenCalledTimes(1);
		expect(onChangeHandler).toHaveBeenCalledWith(true);
	});
});
