import React, { FunctionComponent } from 'react';

import { BlockIntro } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ItemVideoDescription } from '../../../item/components';
import { getFragmentProperty } from '../../helpers';

interface FragmentDetailProps {
	collectionFragment: Avo.Collection.Fragment;
	showDescription: boolean;
}

/**
 * Renders the collection body with all of its fragments for the detail page
 * The bottom meta data is not included in the component
 * @param props FragmentDetailProps
 * @constructor
 */
// TODO: Split up in FragmentDetailList and FragmentDetail component.
const FragmentDetail: FunctionComponent<FragmentDetailProps> = ({
	collectionFragment,
	showDescription,
}) => {
	return collectionFragment.item_meta ? (
		<ItemVideoDescription
			showDescription={showDescription}
			showTitle={true}
			itemMetaData={collectionFragment.item_meta}
			showTitleOnVideo={false}
			title={getFragmentProperty(
				collectionFragment.item_meta,
				collectionFragment,
				collectionFragment.use_custom_fields,
				'title'
			)}
			description={getFragmentProperty(
				collectionFragment.item_meta,
				collectionFragment,
				collectionFragment.use_custom_fields,
				'description'
			)}
		/>
	) : (
		<BlockIntro
			text={collectionFragment.custom_description || ''}
			subtitle={collectionFragment.custom_title || ''}
		/>
	);
};

export default FragmentDetail;
