import { shallow } from 'enzyme';
import React from 'react';

import { Column } from './Column';
import { Grid } from './Grid';

describe('<Grid />', () => {
	it('Should be able to render', () => {
		shallow(
			<Grid>
				<Column size="6">Hello</Column>
			</Grid>
		);
	});

	it('Should correctly set the className', () => {
		const gridComponent = shallow(
			<Grid>
				<Column size="6">Hello</Column>
			</Grid>
		);

		expect(gridComponent.hasClass('o-grid')).toEqual(true);
	});

	it('Should correctly pass children', () => {
		const gridComponent = shallow(
			<Grid>
				<Column size="6">Hello</Column>
			</Grid>
		);

		const columnComponent = gridComponent.find(Column);

		expect(gridComponent.children().html()).toEqual(columnComponent.html());
	});
});
