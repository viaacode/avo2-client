import React, { FunctionComponent } from 'react';

import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';

import FragmentDetail from './FragmentDetail';

interface FragmentDetailProps extends DefaultSecureRouteProps {
	collectionFragments: Avo.Collection.Fragment[];
	showDescriptionNextToVideo: boolean;
}

/**
 * Renders the collection body with all of its fragments for the detail page
 * The bottom meta data is not included in the component
 * @param collectionFragments
 * @param showDescriptionNextToVideo
 * @param props FragmentDetailProps
 * @constructor
 */
const FragmentListDetail: FunctionComponent<FragmentDetailProps> = ({
	collectionFragments,
	showDescriptionNextToVideo,
	...props
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
						{...props}
					/>
				</li>
			);
		});

	return <ul className="c-collection-list">{renderCollectionFragments()}</ul>;
};

export default FragmentListDetail;
