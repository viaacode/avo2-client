import React, { Fragment, FunctionComponent, useState } from 'react';

import { RouteComponentProps } from 'react-router';
import { DraggableList } from '../../shared/components/DraggableList/DraggableList';

interface CollectionsProps extends RouteComponentProps {}

export const Collections: FunctionComponent<CollectionsProps> = ({}) => {
	const [elements, setElements] = useState([<div>Element 1</div>, <div>Element 2</div>]);

	return (
		<Fragment>
			<DraggableList elements={elements} onListChange={elements => setElements(elements)} />
		</Fragment>
	);
};
