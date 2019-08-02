import React, { Fragment, FunctionComponent } from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

import { gql } from 'apollo-boost';

import { Avo } from '@viaa/avo2-types';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';

interface CollectionsProps extends RouteComponentProps {}

// Owner will be enforced by permissions inside the graphql server
// TODO reduce number of properties to only the ones we use
const GET_COLLECTIONS_BY_OWNER = gql`
	query getMigrateCollectionById($ownerId: Int!) {
		migrate_collections(where: { d_ownerid: { _eq: $ownerId } }) {
			description
			title
			is_public
			id
			lom_references {
				lom_value
				id
			}
			type_id
			d_ownerid
			created_at
			updated_at
			organisation_id
			mediamosa_id
		}
	}
`;

const Collections: FunctionComponent<CollectionsProps & RouteComponentProps> = () => {
	const renderCollections = (data: Avo.Collection.Response[]) => {
		return data.map((collection: Avo.Collection.Response) => (
			<Fragment key={`collection-${collection.id}`}>
				<Link to={`/collection/${collection.id}`}>{collection.title}</Link>
				<br />
			</Fragment>
		));
	};

	// TODO get actual owner id from ldap user + map to old drupal userid
	return (
		<DataQueryComponent
			query={GET_COLLECTIONS_BY_OWNER}
			variables={{ ownerId: 1 }}
			resultPath="migrate_collections"
			renderData={renderCollections}
			notFoundMessage="Er konden geen collecties worden gevonden"
		/>
	);
};

export default Collections;
