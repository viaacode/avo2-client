import { mount, shallow } from 'enzyme';
import React from 'react';

import { Button } from '../Button/Button';

import { ToggleButton } from './ToggleButton';

describe('<ToggleButton />', () => {
	it('Should be able to render', () => {
		shallow(<ToggleButton icon="heart" active={false} />);
	});

	it('Should set the normal version of the icon when not `active`', () => {
		const toggleButtonComponent = shallow(<ToggleButton icon="bookmark" active={false} />);

		const buttonComponent = toggleButtonComponent.find(Button);

		expect(buttonComponent.prop('icon')).toEqual('bookmark');
	});

	it('Should set the filled version of the icon when `active`', () => {
		const toggleButtonComponent = shallow(<ToggleButton icon="bookmark" active={true} />);

		const buttonComponent = toggleButtonComponent.find(Button);

		expect(buttonComponent.prop('icon')).toEqual('bookmark-filled');
	});

	it('Should call the `onClick`-handler when clicked', () => {
		const onClickHandler = jest.fn();

		const active = true;

		const toggleButtonComponent = mount(
			<ToggleButton icon="bookmark" active={active} onClick={onClickHandler} />
		);

		const buttonElement = toggleButtonComponent.find('button');

		buttonElement.simulate('click');

		expect(onClickHandler).toHaveBeenCalled();
		expect(onClickHandler).toHaveBeenCalledTimes(1);
		expect(onClickHandler).toHaveBeenCalledWith(!active);

		buttonElement.simulate('click');

		expect(onClickHandler).toHaveBeenCalledTimes(2);
		expect(onClickHandler).toHaveBeenCalledWith(active);
	});
});
