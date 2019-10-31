import React from 'react';

import { shallow } from 'enzyme';

import { ActionsBar } from './ActionsBar';

describe('<ActionsBar />', () => {
	const actionClassName = 'c-custom-action';
	const actionsBarComponent = shallow(
		<ActionsBar fixed>
			<button className={actionClassName}>Click me!</button>
		</ActionsBar>
	);

	it('Should be able to render', () => {
		shallow(<ActionsBar />);
	});

	it('Should set the correct className', () => {
		expect(actionsBarComponent.hasClass('c-actions-bar')).toBeTruthy();
	});

	it('Should render children when passed', () => {
		expect(actionsBarComponent.find(`.${actionClassName}`)).toHaveLength(1);
	});

	it('Should set the correct className when `fixed` is given', () => {
		expect(actionsBarComponent.hasClass('c-actions-bar--fixed')).toBeTruthy();
	});
});
