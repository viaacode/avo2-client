import React, { FunctionComponent } from 'react';
import { arrayMove, List } from 'react-movable';

export interface DraggableListProps {
	onListChange: (updatedList: string[]) => void;
	values: string[];
	renderList: () => React.ReactNode;
	renderItem: () => React.ReactNode;
}

export const DraggableList: FunctionComponent<DraggableListProps> = ({ onListChange, values }) => {
	return (
		<List
			values={values}
			onChange={({ oldIndex, newIndex }) => onListChange(arrayMove(values, oldIndex, newIndex))}
			renderList={({ children, props }) => <ul {...props}>{children}</ul>}
			renderItem={({ value, props }) => <li {...props}>{value}</li>}
		/>
	);
};
