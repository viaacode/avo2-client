import { mount, shallow } from 'enzyme';
import React from 'react';

import { MENU_ICON_OPTIONS } from '../../../menu/menu.const';
import IconPicker from './IconPicker';

const iconPickerProps = {
	className: 'c-icon-picker-custom',
	options: MENU_ICON_OPTIONS,
};

describe('<IconPicker />', () => {
	const iconPickerComponent = shallow(<IconPicker {...iconPickerProps} />);

	it('Should be able to render', () => {
		shallow(<IconPicker {...iconPickerProps} />);
	});

	it('Should set the correct className', () => {
		expect(iconPickerComponent.hasClass('c-icon-picker')).toBeTruthy();
		expect(iconPickerComponent.hasClass(iconPickerProps.className)).toBeTruthy();
	});

	it('Should show the correct icon in options', () => {
		const wrapper = mount(<IconPicker {...iconPickerProps} menuIsOpen />);
		const iconPickeMenu = wrapper.find('.react-select__menu-list');
		const iconPickerIcon = iconPickeMenu.find('.react-select__option .o-svg-icon');

		expect(iconPickerIcon.at(0).hasClass(`o-svg-icon--${MENU_ICON_OPTIONS[0].value}`)).toBeTruthy();
		expect(iconPickerIcon.at(1).hasClass(`o-svg-icon--${MENU_ICON_OPTIONS[1].value}`)).toBeTruthy();
	});
});
