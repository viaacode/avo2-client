import { mount, shallow } from 'enzyme';
import React from 'react';

import { DraggableList } from './DraggableList';

const mockElements = [<div>Element 1</div>, <div>Element 2</div>];

describe('<DraggableList />', () => {
	it('Should be able to render', () => {
		shallow(<DraggableList elements={mockElements} onListChange={mockElements => {}} />);
	});
});
