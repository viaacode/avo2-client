import { mount, shallow } from 'enzyme';
import React from 'react';

import { Dropdown } from './Dropdown';

describe('<Dropdown />', () => {
	it('Should be able to render', () => {
		shallow(
			<Dropdown label="Show options" isOpen={false}>
				<div>OneOneOneOneOneOne</div>
				<div>Two</div>
				<div>Three</div>
				<div>Four</div>
				<div>Five</div>
			</Dropdown>
		);
	});

	it('Should render correctly with `isOpen = false`', () => {
		const dropdownComponent = shallow(
			<Dropdown label="Show options" isOpen={false}>
				<div>OneOneOneOneOneOne</div>
				<div>Two</div>
				<div>Three</div>
				<div>Four</div>
				<div>Five</div>
			</Dropdown>
		);

		expect(dropdownComponent.find('.c-menu')).toHaveLength(0);
	});

	it('Shouldrender correctly with `isOpen = true`', () => {
		const dropdownComponent = mount(
			<Dropdown label="Show options" isOpen={true}>
				<div>OneOneOneOneOneOne</div>
				<div>Two</div>
				<div>Three</div>
				<div>Four</div>
				<div>Five</div>
			</Dropdown>
		);

		expect(dropdownComponent.find('.c-menu')).toHaveLength(1);
		expect(dropdownComponent.find('.c-menu--visible')).toHaveLength(1);
	});

	it('Should call `onOpen` when clicking the button (and `isOpen = false`)', () => {
		const onOpenHandler = jest.fn();

		const dropdownComponent = mount(
			<Dropdown label="Show options" isOpen={false} onOpen={onOpenHandler}>
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

		expect(onOpenHandler).toHaveBeenCalled();
		expect(onOpenHandler).toHaveBeenCalledTimes(1);
	});

	it('Should call `onClose` when clicking the button (and `isOpen = true`)', () => {
		const onCloseHandler = jest.fn();

		const dropdownComponent = mount(
			<Dropdown label="Show options" isOpen={true} onClose={onCloseHandler}>
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

		expect(onCloseHandler).toHaveBeenCalled();
		expect(onCloseHandler).toHaveBeenCalledTimes(1);
	});

	it('Should set the correct className for button', () => {
		const dropdownComponent = mount(
			<Dropdown label="Show options" isOpen={false}>
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

	it('Should correctly pass `label`', () => {
		const label = 'Test label';

		const dropdownComponent = mount(
			<Dropdown label={label} isOpen={false}>
				<div>OneOneOneOneOneOne</div>
				<div>Two</div>
				<div>Three</div>
				<div>Four</div>
				<div>Five</div>
			</Dropdown>
		);

		expect(dropdownComponent.find('.c-button__label').text()).toEqual(label);
	});
});
