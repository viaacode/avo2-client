import { sortBy } from 'lodash-es';
import React, { FunctionComponent } from 'react';

import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';

import CollectionListDetail from './CollectionListDetail';

interface FragmentDetailProps extends DefaultSecureRouteProps {
	collectionFragments: Avo.Collection.Fragment[];
}

/**
 * Renders the collection body with all of its fragments for the detail page
 * The bottom meta data is not included in the component
 * @param collectionFragments
 * @param showDescriptionNextToVideo
 * @constructor
 */
const CollectionList: FunctionComponent<FragmentDetailProps> = ({
	collectionFragments,
	...rest
}) => {
	const renderCollectionFragments = () => {
		return sortBy(collectionFragments, 'position').map((fragment: Avo.Collection.Fragment) => {
			return (
				<li className="c-collection-list__item" key={`collection-fragment-${fragment.id}`}>
					<CollectionListDetail collectionFragment={fragment} {...rest} />
				</li>
			);
		});
	};

	return <ul className="c-collection-list">{renderCollectionFragments()}</ul>;
};

export default CollectionList;
