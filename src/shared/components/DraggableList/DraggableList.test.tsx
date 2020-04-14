import { mount, shallow } from 'enzyme';
import React from 'react';

import { DraggableList } from './DraggableList';

const mockElements = [<div>Element 1</div>, <div>Element 2</div>];

describe('<DraggableList />', () => {
	it('Should be able to render', () => {
		shallow(<DraggableList elements={mockElements} onListChange={() => {}} />);
	});

	it('Should set the correct className', () => {
		const draggableListComponent = shallow(
			<DraggableList elements={mockElements} onListChange={() => {}} />
		);

		expect(draggableListComponent.hasClass('c-table-view')).toEqual(true);
	});

	it('Should correctly pass children', () => {
		const draggableListComponent = mount(
			<DraggableList elements={mockElements} onListChange={() => {}} />
		);

		const draggableListItems = draggableListComponent.find('.c-table-view__item');

		expect(draggableListItems).toHaveLength(mockElements.length);
	});

	it('Should initialize with null as currentlyBeingDragged state', () => {
		const draggableListComponent = mount(
			<DraggableList elements={mockElements} onListChange={() => {}} />
		);

		expect(draggableListComponent.state('currentlyBeingDragged')).toEqual(null);
	});

	it('Should initialize with null as currentlyBeingDragged state', () => {
		const draggableListComponent = mount(
			<DraggableList elements={mockElements} onListChange={() => {}} />
		);

		expect(draggableListComponent.state('currentlyBeingDragged')).toEqual(null);
	});

	it('Should set currentlyBeingDragged state on onDragStart', () => {
		const draggableListComponent = mount(
			<DraggableList elements={mockElements} onListChange={() => {}} />
		);

		const draggableListItems = draggableListComponent.find('.c-table-view__item');
		draggableListItems.at(1).simulate('dragstart');

		expect(draggableListComponent.state('currentlyBeingDragged')).toEqual(mockElements[1]);
	});

	it('Should clear currentlyBeingDragged state on onDragEnd', () => {
		const draggableListComponent = mount(
			<DraggableList elements={mockElements} onListChange={() => {}} />
		);

		const draggableListItems = draggableListComponent.find('.c-table-view__item');
		draggableListItems.at(1).simulate('dragstart');
		draggableListItems.at(1).simulate('dragend');

		expect(draggableListComponent.state('currentlyBeingDragged')).toEqual(null);
	});
});
