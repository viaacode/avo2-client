import React, { Fragment, FunctionComponent, useEffect } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';

import { Avo } from '@viaa/avo2-types';
import { Link } from 'react-router-dom';
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
