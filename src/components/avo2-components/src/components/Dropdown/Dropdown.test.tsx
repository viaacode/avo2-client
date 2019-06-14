import { mount, shallow } from 'enzyme';
import React, { Fragment } from 'react';

import { Button, Modal } from '../..';
import { Dropdown } from './Dropdown';

describe('<Dropdown />', () => {
	it('Should be able to render', () => {
		shallow(
			<Dropdown label="Show options">
				<div>OneOneOneOneOneOne</div>
				<div>Two</div>
				<div>Three</div>
				<div>Four</div>
				<div>Five</div>
			</Dropdown>
		);
	});

	it('Should by default render with a closed flyout', () => {
		const dropdownComponent = shallow(
			<Dropdown label="Show options">
				<div>OneOneOneOneOneOne</div>
				<div>Two</div>
				<div>Three</div>
				<div>Four</div>
				<div>Five</div>
			</Dropdown>
		);

		expect(dropdownComponent.find('.c-menu')).toHaveLength(0);
	});

	it('Should open flyout when clicking the button', () => {
		const dropdownComponent = mount(
			<Dropdown label="Show options">
				<div>OneOneOneOneOneOne</div>
				<div>Two</div>
				<div>Three</div>
				<div>Four</div>
				<div>Five</div>
			</Dropdown>
		);

		dropdownComponent
			.find('button')
			.first()
			.simulate('click');

		expect(dropdownComponent.find('.c-menu')).toHaveLength(1);
	});

	it('Should set the correct className for button', () => {
		const dropdownComponent = mount(
			<Dropdown label="Show options">
				<div>OneOneOneOneOneOne</div>
				<div>Two</div>
				<div>Three</div>
				<div>Four</div>
				<div>Five</div>
			</Dropdown>
		);

		expect(
			dropdownComponent
				.find('button')
				.first()
				.hasClass('c-button')
		).toEqual(true);
	});

	it('Should call the onOpen/onClose handlers when opening/closing the flyout', () => {
		const onOpenHandler = jest.fn();
		const onCloseHandler = jest.fn();

		const dropdownComponent = mount(
			<Dropdown label="Show options" onOpen={onOpenHandler} onClose={onCloseHandler}>
				<div>OneOneOneOneOneOne</div>
				<div>Two</div>
				<div>Three</div>
				<div>Four</div>
				<div>Five</div>
			</Dropdown>
		);

		const dropdownButton = dropdownComponent.find('.c-button');
		const dropdownMenu = dropdownComponent.find('.c-menu');

		dropdownButton.simulate('click');

		expect(onOpenHandler).toHaveBeenCalled();
		expect(onOpenHandler).toHaveBeenCalledTimes(1);
		expect(onCloseHandler).toHaveBeenCalledTimes(0);

		dropdownMenu.simulate('click');

		expect(onOpenHandler).toHaveBeenCalledTimes(1);
		expect(onCloseHandler).toHaveBeenCalledTimes(0);

		dropdownButton.simulate('click');

		expect(onOpenHandler).toHaveBeenCalledTimes(1);
		expect(onCloseHandler).toHaveBeenCalled();
		expect(onCloseHandler).toHaveBeenCalledTimes(1);
	});

	it('Should close flyout when close button is clicked inside the dropdown', () => {
		const onCloseHandler = jest.fn();

		const dropdownComponent = mount(
			<Dropdown label="Show options" onClose={onCloseHandler}>
				<div>OneOneOneOneOneOne</div>
				<div>Two</div>
				<div>Three</div>
				<div>Four</div>
				<div>Five</div>
				<Button className="c-dropdown-menu__close" label="Close" block={true} />
			</Dropdown>
		);

		const closeButton = dropdownComponent.find('.c-dropdown-menu__close');

		closeButton.simulate('click');

		expect(onCloseHandler).toHaveBeenCalled();
		expect(onCloseHandler).toHaveBeenCalledTimes(1);
	});
});
