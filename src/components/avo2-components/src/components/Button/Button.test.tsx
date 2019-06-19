import { shallow } from 'enzyme';
import React from 'react';

import { Icon } from '../Icon/Icon';

import { Button } from './Button';

describe('<Button />', () => {
	it('Should be able to render', () => {
		shallow(<Button />);
	});

	it('Should set the correct className', () => {
		const buttonComponent = shallow(<Button />);

		expect(buttonComponent.hasClass('c-button')).toEqual(true);
	});

	it('Should set the correct size className', () => {
		const buttonComponent = shallow(<Button size="small" />);

		expect(buttonComponent.hasClass('c-button--small')).toEqual(true);
	});

	it('Should set the correct width className when passing block option', () => {
		const buttonDefaultComponent = shallow(<Button />);
		const buttonBlockTrueComponent = shallow(<Button block={true} />);
		const buttonBlockFalseComponent = shallow(<Button block={false} />);

		expect(buttonDefaultComponent.hasClass('c-button--block')).toEqual(false);
		expect(buttonBlockTrueComponent.hasClass('c-button--block')).toEqual(true);
		expect(buttonBlockFalseComponent.hasClass('c-button--block')).toEqual(false);
	});

	it('Should set the correct type className', () => {
		const secondaryButtonComponent = shallow(<Button type="secondary" />);
		const dangerButtonComponent = shallow(<Button type="danger" />);
		const linkButtonComponent = shallow(<Button type="link" />);

		expect(secondaryButtonComponent.hasClass('c-button--secondary')).toEqual(true);
		expect(dangerButtonComponent.hasClass('c-button--danger')).toEqual(true);
		expect(linkButtonComponent.hasClass('c-button--link')).toEqual(true);
	});

	it('Should be able to render a label', () => {
		const label = 'Click me!';
		const buttonComponent = shallow(<Button label={label} />);

		const labelElement = buttonComponent.find('.c-button__label');

		expect(labelElement).toHaveLength(1);
		expect(labelElement.text()).toEqual(label);
	});

	it('Should not to render a label when none is passed', () => {
		const buttonComponent = shallow(<Button />);

		const labelElement = buttonComponent.find('.c-button__label');

		expect(labelElement).toHaveLength(0);
	});

	it('Should be able to render a label and an icon', () => {
		const label = 'Click me!';
		const icon = 'search';
		const buttonComponent = shallow(<Button label={label} icon={icon} />);

		const labelElement = buttonComponent.find('.c-button__label');
		const iconComponent = buttonComponent.find(Icon);

		expect(labelElement).toHaveLength(1);
		expect(labelElement.text()).toEqual(label);
		expect(iconComponent).toHaveLength(1);
		expect(iconComponent.props()).toMatchObject({ name: icon });
	});

	it('Should get a special className when only an icon is passed', () => {
		const buttonComponent = shallow(<Button icon="link" />);

		expect(buttonComponent.hasClass('c-button--icon')).toEqual(true);
	});

	it('Should be able to render an arrow at the end of the button', () => {
		const buttonComponent = shallow(<Button arrow />);

		const arrowComponent = buttonComponent.find(Icon);

		expect(arrowComponent).toHaveLength(1);
		expect(arrowComponent.props()).toMatchObject({ name: 'caret-down' });
	});

	it('Should call the `onClick`-handler when clicked', () => {
		const onClickHandler = jest.fn();

		const buttonComponent = shallow(<Button onClick={onClickHandler} />);

		const buttonElement = buttonComponent.find('button');

		buttonElement.simulate('click');

		expect(onClickHandler).toHaveBeenCalled();
		expect(onClickHandler).toHaveBeenCalledTimes(1);

		buttonElement.simulate('click');

		expect(onClickHandler).toHaveBeenCalledTimes(2);
	});

	it('Should pass on the `disabled`-attribute', () => {
		const buttonComponent = shallow(<Button disabled />);

		const buttonElement = buttonComponent.find('button');

		expect(buttonElement.prop('disabled')).toEqual(true);
	});
});
