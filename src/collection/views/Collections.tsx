import React, { Fragment, FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';

import { Avo } from '@viaa/avo2-types';
import { Link } from 'react-router-dom';
import { DraggableList } from '../../shared/components/DraggableList/DraggableList';
import { getCollections } from '../store/actions';
import { selectCollections } from '../store/selectors';

interface CollectionsProps extends RouteComponentProps {
	collections: Avo.Collection.Response[] | null;
	getCollections: () => Dispatch;
}

const Collections: FunctionComponent<CollectionsProps & RouteComponentProps> = ({
	collections,
	getCollections,
}) => {
	useEffect(() => {
		getCollections();
	}, [getCollections]);
	const [elements, setElements] = useState([
		<div>Element 1</div>,
		<div>Element 2</div>,
		<div>Element 3</div>,
		<div>Element 4</div>,
		<div>Element 5</div>,
	]);

	return (
		<Fragment>
			<span>TODO collections</span>
			<br />
			{!!collections &&
				collections.map((collection: Avo.Collection.Response) => (
					<Fragment key={`collection-${collection.id}`}>
						<Link to={`/collection/${collection.id}`}>{collection.title}</Link>
						<br />
					</Fragment>
				))}
			<DraggableList elements={elements} onListChange={elements => setElements(elements)} />
		</Fragment>
	);
};

const mapStateToProps = (state: any) => ({
	collections: selectCollections(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		getCollections: () => dispatch(getCollections() as any),
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Collections);
