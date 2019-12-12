import React, { FunctionComponent } from 'react';

import { BlockIntro } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { ItemVideoDescription } from '../../../item/components';

interface FragmentDetailProps extends DefaultSecureRouteProps {
	collectionFragment: Avo.Collection.Fragment;
	showDescriptionNextToVideo: boolean;
}

/**
 * Renders the collection body with all of its fragments for the detail page
 * The bottom meta data is not included in the component
 * @param collectionFragment
 * @param showDescriptionNextToVideo
 * @param props FragmentDetailProps
 * @constructor
 */
// TODO: Split up in FragmentDetailList and FragmentDetail component.
const FragmentDetail: FunctionComponent<FragmentDetailProps> = ({
	collectionFragment,
	showDescriptionNextToVideo,
	...props
}) => {
	return collectionFragment.item_meta ? (
		<ItemVideoDescription
			showDescriptionNextToVideo={showDescriptionNextToVideo}
			itemMetaData={collectionFragment.item_meta}
			showTitleOnVideo={false}
			{...props}
		/>
	) : (
		<BlockIntro
			text={collectionFragment.custom_description || ''}
			subtitle={collectionFragment.custom_title || ''}
		/>
	);
};

export default FragmentDetail;
