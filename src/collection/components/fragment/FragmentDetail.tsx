import { get } from 'lodash-es';
import React, { FunctionComponent } from 'react';

import { BlockIntro } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { APP_PATH } from '../../../constants';
import { ItemVideoDescription } from '../../../item/components';
import { DEFAULT_AUDIO_STILL } from '../../../shared/constants';
import { buildLink } from '../../../shared/helpers';
import { getFragmentProperty } from '../../helpers';

import './FragmentDetail.scss';

interface FragmentDetailProps extends DefaultSecureRouteProps {
	collectionFragment: Avo.Collection.Fragment;
	showDescription: boolean;
	linkToItems: boolean;
	canPlay?: boolean;
}

/**
 * Renders the collection body with all of its fragments for the detail page
 * The bottom meta data is not included in the component
 * @param collectionFragment
 * @param showDescriptionNextToVideo
 * @constructor
 */
const FragmentDetail: FunctionComponent<FragmentDetailProps> = ({
	collectionFragment,
	showDescription,
	linkToItems,
	history,
}) => {
	if (get(collectionFragment, 'item_meta.type.label') === 'audio') {
		collectionFragment.thumbnail_path = DEFAULT_AUDIO_STILL;
	}

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
						buildLink(APP_PATH.ITEM_DETAIL.route, {
							id: (collectionFragment.item_meta as Avo.Item.Item).external_id,
						}),
						history
					);
				}
			};
		}
	};

	return collectionFragment.item_meta ? (
		<ItemVideoDescription
			showDescription={showDescription}
			showTitle
			itemMetaData={{
				...(collectionFragment.item_meta as Avo.Item.Item),
				thumbnail_path:
					collectionFragment.thumbnail_path ||
					(collectionFragment.item_meta as Avo.Item.Item).thumbnail_path,
			}}
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
			cuePoints={{
				start: collectionFragment.start_oc,
				end: collectionFragment.end_oc,
			}}
		/>
	) : (
		<BlockIntro
			content={collectionFragment.custom_description || ''}
			title={collectionFragment.custom_title || ''}
			headingType="h3"
			align="center"
			className="c-fragment-detail__intro-block"
		/>
	);
};

export default FragmentDetail;
