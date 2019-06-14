import { shallow } from 'enzyme';
import React from 'react';

import { Column } from './Column';

describe('<Column />', () => {
	it('Should be able to render', () => {
		shallow(<Column size="6">Hello!</Column>);
	});

	it('Should correctly set the sizing className', () => {
		const size = '12';

		const columnComponent = shallow(<Column size={size}>Hello!</Column>);

		expect(columnComponent.hasClass(`o-grid-col-${size}`)).toEqual(true);
	});

	it('Should correctly pass children', () => {
		const columnComponent = shallow(
			<Column size="12">
				<p>Hello!</p>
			</Column>
		);

		const children = columnComponent.find('p');

		expect(columnComponent.children().html()).toEqual(children.html());
	});
});
