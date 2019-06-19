import { shallow } from 'enzyme';
import React from 'react';

import { Badge } from './Badge';

describe('<Badge />', () => {
	it('Should be able to render', () => {
		shallow(<Badge text="this is a badge" />);
	});

	it('Should set the correct className', () => {
		const badgeComponent = shallow(<Badge text="this is a badge" />);

		expect(badgeComponent.hasClass('c-badge')).toEqual(true);
	});

	it('Should set the correct className for every type', () => {
		const badgeComponent = shallow(<Badge text="this is a badge" />);
		const successBadgeComponent = shallow(<Badge text="this is a badge" type="success" />);
		const errorBadgeComponent = shallow(<Badge text="this is a badge" type="error" />);

		expect(badgeComponent.hasClass('c-badge--default')).toEqual(true);
		expect(successBadgeComponent.hasClass('c-badge--success')).toEqual(true);
		expect(errorBadgeComponent.hasClass('c-badge--error')).toEqual(true);
	});

	it('Should render the text correctly', () => {
		const text = 'this is a badge';
		const badgeComponent = shallow(<Badge text={text} />);

		expect(badgeComponent.text()).toEqual(text);
	});
});
