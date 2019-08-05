import React, { Fragment, FunctionComponent, useEffect } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link, withRouter } from 'react-router-dom';

import { Avo } from '@viaa/avo2-types';
import { compose, Dispatch } from 'redux';

import { getCollections } from '../store/actions';
import { selectCollections } from '../store/selectors';

interface CollectionsProps extends RouteComponentProps {
	collections: Avo.Collection.Response[] | null;
	getCollections: () => Dispatch;
}

const Collections: FunctionComponent<CollectionsProps> = ({ collections, getCollections }) => {
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

export default compose<FunctionComponent>(
	connect(
		mapStateToProps,
		mapDispatchToProps
	),
	withRouter
)(Collections);
