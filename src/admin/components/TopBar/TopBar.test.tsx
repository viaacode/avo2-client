import React from 'react';

import { shallow } from 'enzyme';

import { TopBar } from './TopBar';

describe('<TopBar />', () => {
	const navigateBack = jest.fn();
	const topBarComponent = shallow(<TopBar navigateBack={navigateBack} />);

	it('Should be able to render', () => {
		shallow(<TopBar navigateBack={navigateBack} />);
	});

	it('Should set the correct className', () => {
		expect(topBarComponent.hasClass('c-top-bar')).toBeTruthy();
	});

	it('Should render a back button based on `navigateBack` prop', () => {
		expect(topBarComponent.find('.c-top-bar__back')).toHaveLength(1);

		topBarComponent.setProps({ navigateBack: null });
		expect(topBarComponent.find('.c-top-bar__back')).toHaveLength(0);
	});
});
