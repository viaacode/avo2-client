import React, { FunctionComponent } from 'react';

import { Avo } from '@viaa/avo2-types';

import FragmentDetail from './FragmentDetail';

interface FragmentDetailProps {
	collectionFragments: Avo.Collection.Fragment[];
	showDescriptionNextToVideo: boolean;
}

/**
 * Renders the collection body with all of its fragments for the detail page
 * The bottom meta data is not included in the component
 * @param props FragmentDetailProps
 * @constructor
 */
const FragmentListDetail: FunctionComponent<FragmentDetailProps> = ({
	collectionFragments,
	showDescriptionNextToVideo,
}) => {
	const renderCollectionFragments = () =>
		collectionFragments.map((collectionFragment: Avo.Collection.Fragment) => {
			return (
				<li
					className="c-collection-list__item"
					key={`collection-fragment-${collectionFragment.id}`}
				>
					<FragmentDetail
						collectionFragment={collectionFragment}
						showDescriptionNextToVideo={showDescriptionNextToVideo}
					/>
				</li>
			);
		});

	return <ul className="c-collection-list">{renderCollectionFragments()}</ul>;
};

export default FragmentListDetail;
