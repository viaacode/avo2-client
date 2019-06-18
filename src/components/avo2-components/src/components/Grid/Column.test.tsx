import { shallow } from 'enzyme';
import React from 'react';

import { Column } from './Column';

describe('<Column />', () => {
	it('Should be able to render', () => {
		shallow(<Column size="6">Hello!</Column>);
	});

	it('Should correctly set the sizing className', () => {
		const size1 = '12';
		const size2 = '1-4';
		const size3 = '2-11';

		const columnComponent1 = shallow(<Column size={size1}>Hello!</Column>);
		const columnComponent2 = shallow(<Column size={size2}>Hello!</Column>);
		const columnComponent3 = shallow(<Column size={size3}>Hello!</Column>);

		expect(columnComponent1.hasClass(`o-grid-col-${size1}`)).toEqual(true);
		expect(columnComponent2.hasClass(`o-grid-col-bp${size2}`)).toEqual(true);
		expect(columnComponent3.hasClass(`o-grid-col-bp${size3}`)).toEqual(true);
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
