import { shallow } from 'enzyme';
import React from 'react';

import { Spinner } from './Spinner';

describe('<Spinner />', () => {
	it('Should be able to render', () => {
		shallow(<Spinner />);
	});

	it('Should correctly set the className', () => {
		const spinnerComponent = shallow(<Spinner />);

		expect(spinnerComponent.hasClass('c-spinner')).toEqual(true);
	});

	it('Should have 12 spinner bars', () => {
		const spinnerComponent = shallow(<Spinner />);

		expect(spinnerComponent.find('.c-spinner__bar')).toHaveLength(12);
	});

	it('Should be able to render as a large spinner', () => {
		const spinnerComponent = shallow(<Spinner size="large" />);

		expect(spinnerComponent.hasClass('c-spinner--large')).toEqual(true);
	});
});
