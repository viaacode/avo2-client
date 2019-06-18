import { shallow } from 'enzyme';
import React from 'react';

import { RadioButton } from './RadioButton';

describe('<RadioButton />', () => {
	it('Should be able to render', () => {
		shallow(<RadioButton name="List1" label="One" value="one" />);
	});

	it('Should set the correct className', () => {
		const radioButtonComponent = shallow(<RadioButton name="List2" label="One" value="one" />);

		expect(radioButtonComponent.hasClass('c-radio')).toEqual(true);
	});

	it('Should be able to render with id correctly set', () => {
		const radioButtonComponent = shallow(
			<RadioButton name="List3" label="One" value="one" id="one" />
		);

		expect(radioButtonComponent.find('[type="radio"]').prop('id')).toEqual('one');
	});

	it('Should be able to render with name correctly set', () => {
		const radioButtonComponent = shallow(<RadioButton name="List4" label="One" value="one" />);

		expect(radioButtonComponent.find('[type="radio"]').prop('name')).toEqual('List4');
	});

	it('Should be able to render with label correctly set', () => {
		const radioButtonComponent = shallow(<RadioButton name="List5" label="One" value="one" />);

		expect(radioButtonComponent.find('label').html()).toContain('One');
	});

	it('Should be able to render without an id', () => {
		const radioButtonComponent = shallow(<RadioButton name="List6" label="One" value="one" />);

		expect(radioButtonComponent.find('[type="radio"]').prop('id')).toEqual(undefined);
	});

	it('Should set the defaultChecked-prop as the initial state', () => {
		const radioButtonComponentTrue = shallow(
			<RadioButton name="List7" label="One" id="one" value="one" defaultChecked={true} />
		);
		const radioButtonComponentFalse = shallow(
			<RadioButton name="List8" label="One" id="one" value="one" defaultChecked={false} />
		);

		expect(radioButtonComponentTrue.find('[type="radio"]').prop('checked')).toEqual(true);
		expect(radioButtonComponentFalse.find('[type="radio"]').prop('checked')).toEqual(false);
	});

	it('Should have a default value of false for the checked-state', () => {
		const radioButtonComponent = shallow(
			<RadioButton name="List9" label="One" id="one" value="one" />
		);

		expect(radioButtonComponent.find('[type="radio"]').prop('checked')).toEqual(false);
	});

	it('Should call `onChange` when toggling radio button', () => {
		const onChangeHandler = jest.fn();

		const radioButtonComponent = shallow(
			<RadioButton name="List10" label="One" id="one" value="one" onChange={onChangeHandler} />
		);

		const radioButtonElement = radioButtonComponent.find('[type="radio"]');

		radioButtonElement.simulate('change', { target: { checked: true } });

		expect(onChangeHandler).toHaveBeenCalled();
		expect(onChangeHandler).toHaveBeenCalledTimes(1);
		expect(onChangeHandler).toHaveBeenCalledWith(true);
	});
});
