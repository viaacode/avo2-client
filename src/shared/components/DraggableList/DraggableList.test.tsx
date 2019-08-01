import { mount, shallow } from 'enzyme';
import React from 'react';

import { DraggableList } from './DraggableList';

const mockElements = [<div>Element 1</div>, <div>Element 2</div>];

describe('<DraggableList />', () => {
	it('Should be able to render', () => {
		shallow(<DraggableList elements={mockElements} onListChange={mockElements => {}} />);
	});

	it('Should set the correct className', () => {
		const draggableListComponent = shallow(
			<DraggableList elements={mockElements} onListChange={mockElements => {}} />
		);

		expect(draggableListComponent.hasClass('c-table-view')).toEqual(true);
	});

	it('Should correctly pass children', () => {
		const draggableListComponent = mount(
			<DraggableList elements={mockElements} onListChange={mockElements => {}} />
		);

		const draggableListItems = draggableListComponent.find('.c-table-view__item');

		expect(draggableListItems).toHaveLength(mockElements.length);
	});
});
