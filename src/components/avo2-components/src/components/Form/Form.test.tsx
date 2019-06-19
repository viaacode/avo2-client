import { shallow } from 'enzyme';
import React, { Fragment } from 'react';

import { Form } from './Form';

describe('<Form />', () => {
	it('Should be able to render', () => {
		shallow(
			<Form>
				<Fragment />
			</Form>
		);
	});

	it('Should correctly set the className', () => {
		const formComponent = shallow(
			<Form>
				<Fragment />
			</Form>
		);

		expect(formComponent.hasClass('o-form-group-layout')).toEqual(true);
	});

	it('Should set the correct type className', () => {
		const formComponent = shallow(
			<Form>
				<Fragment />
			</Form>
		);
		const horizontalFormComponent = shallow(
			<Form type="horizontal">
				<Fragment />
			</Form>
		);
		const inlineFormComponent = shallow(
			<Form type="inline">
				<Fragment />
			</Form>
		);

		expect(formComponent.hasClass('o-form-group-layout--standard')).toEqual(true);
		expect(horizontalFormComponent.hasClass('o-form-group-layout--horizontal')).toEqual(true);
		expect(inlineFormComponent.hasClass('o-form-group-layout--inline')).toEqual(true);
	});

	it('Should correctly pass children', () => {
		const formComponent = shallow(
			<Form>
				<div id="form-test">Testing 123</div>
			</Form>
		);

		const testElement = formComponent.find('#form-test');

		expect(formComponent.children().html()).toEqual(testElement.html());
	});
});
