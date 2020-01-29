import React, { FunctionComponent } from 'react';

import { BlockIntro } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { APP_PATH } from '../../../constants';
import { ItemVideoDescription } from '../../../item/components';
import { buildLink } from '../../../shared/helpers';
import { getFragmentProperty } from '../../helpers';

interface FragmentListDetailProps extends DefaultSecureRouteProps {
	collectionFragment: Avo.Collection.Fragment;
	showDescription: boolean;
	linkToItems: boolean;
}

/**
 * Renders the collection body with all of its fragments for the detail page
 * The bottom meta data is not included in the component
 * @param collectionFragment
 * @param showDescriptionNextToVideo
 * @constructor
 */
const FragmentListDetail: FunctionComponent<FragmentListDetailProps> = ({
	collectionFragment,
	showDescription,
	linkToItems,
	history,
	...rest
}) => {
	const getTitleClickedHandler = () => {
		if (
			linkToItems &&
			collectionFragment.item_meta &&
			collectionFragment.item_meta.type &&
			(collectionFragment.item_meta.type.label === 'video' ||
				collectionFragment.item_meta.type.label === 'audio')
		) {
			return () => {
				if (collectionFragment.item_meta) {
					redirectToClientPage(
						buildLink(APP_PATH.ITEM, {
							id: (collectionFragment.item_meta as Avo.Item.Item).external_id,
						}),
						history
					);
				}
			};
		}
		return undefined;
	};

	return collectionFragment.item_meta ? (
		<ItemVideoDescription
			showDescription={showDescription}
			showTitle
			itemMetaData={collectionFragment.item_meta as Avo.Item.Item}
			showTitleOnVideo={false}
			title={getFragmentProperty(
				collectionFragment.item_meta as Avo.Item.Item,
				collectionFragment,
				collectionFragment.use_custom_fields,
				'title'
			)}
			description={getFragmentProperty(
				collectionFragment.item_meta as Avo.Item.Item,
				collectionFragment,
				collectionFragment.use_custom_fields,
				'description'
			)}
			onTitleClicked={getTitleClickedHandler()}
			history={history}
			{...rest}
		/>
	) : (
		<BlockIntro
			content={collectionFragment.custom_description || ''}
			title={collectionFragment.custom_title || ''}
		/>
	);
};

export default FragmentListDetail;
