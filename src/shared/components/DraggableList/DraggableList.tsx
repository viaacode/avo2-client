import React, { Component } from 'react';

import { Icon } from '@viaa/avo2-components';
import classNames from 'classnames';

export interface DraggableListProps {
	elements: JSX.Element[];
	onListChange: (updatedList: JSX.Element[]) => void;
}

export interface DraggableListState {
	currentlyBeingDragged: JSX.Element | null;
}

export class DraggableList extends Component<DraggableListProps, DraggableListState> {
	constructor(props: DraggableListProps) {
		super(props);

		this.state = {
			currentlyBeingDragged: null,
		};
	}

	onDragStart = (e: any, index: number) => {
		const { elements } = this.props;

		this.setState({
			currentlyBeingDragged: elements[index],
		});

		// Drag animation/metadata
		if (e.dataTransfer && e.target) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/html', e.target);
			e.dataTransfer.setDragImage(e.target, 20, 20);
		}
	};

	onDragOver = (index: number) => {
		const { elements, onListChange } = this.props;
		const { currentlyBeingDragged } = this.state;

		const draggedOverItem = elements[index];

		// Update currentlyBeingDragged if list was updated
		if (!currentlyBeingDragged) {
			this.setState({
				currentlyBeingDragged: elements[index],
			});
		}

		if (currentlyBeingDragged && currentlyBeingDragged !== elements[index]) {
			// Update list of elements
			const updatedList = elements.filter((item: JSX.Element) => item !== currentlyBeingDragged);
			updatedList.splice(index, 0, currentlyBeingDragged);

			// Return updated list
			return onListChange(updatedList);
		}
	};

	onDragEnd = () =>
		this.setState({
			currentlyBeingDragged: null,
		});

	render() {
		const { elements } = this.props;
		const { currentlyBeingDragged } = this.state;

		return (
			<div
				className={classNames(
					'c-table-view',
					{ 'draggable-container--is-dragging': currentlyBeingDragged },
					{ 'draggable-container--over': currentlyBeingDragged }
				)}
			>
				{elements.map((renderElement, index) => (
					<div
						className={classNames(
							'c-table-view__item',
							'c-table-view__item--type-action',
							{ 'draggable-source--is-dragging': renderElement === currentlyBeingDragged },
							{ 'draggable--over': renderElement === currentlyBeingDragged }
						)}
						onDragOver={() => this.onDragOver(index)}
						onDragEnd={this.onDragEnd}
						onDragStart={e => this.onDragStart(e, index)}
						draggable
					>
						<div className="o-grid-col-flex">
							<div className="o-flex">{renderElement}</div>
						</div>
						<div className="o-grid-col-static">
							<div className="u-opacity-50">
								<Icon name="menu" />
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}
}
