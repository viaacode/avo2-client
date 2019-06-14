import { shallow } from 'enzyme';
import React from 'react';

import { Box } from './Box';

describe('<Box />', () => {
	it('Should be able to render', () => {
		shallow(<Box>test</Box>);
	});

	it('Should set the correct className', () => {
		const boxComponent = shallow(<Box>test</Box>);

		expect(boxComponent.hasClass('c-box')).toEqual(true);
	});

	it('Should set the correct className when passed the `condensed`-prop', () => {
		const boxComponent = shallow(<Box condensed>test</Box>);

		expect(boxComponent.hasClass('c-box--padding-small')).toEqual(true);
	});

	it('Should correctly pass children', () => {
		const containerComponent = shallow(
			<Box>
				<p className="box-test" />
			</Box>
		);

		const paragraph = containerComponent.find('.box-test');

		expect(containerComponent.children().html()).toEqual(paragraph.html());
	});
});
