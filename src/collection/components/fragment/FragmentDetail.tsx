import { BlockIntro } from '@meemoo/admin-core-ui/client';
import { type Avo } from '@viaa/avo2-types';
import { get } from 'lodash-es';
import React, { type FC } from 'react';

import { APP_PATH } from '../../../constants';
import { ItemVideoDescription } from '../../../item/components/ItemVideoDescription';
import { DEFAULT_AUDIO_STILL } from '../../../shared/constants';
import { buildLink } from '../../../shared/helpers/build-link';
import { isMobileWidth } from '../../../shared/helpers/media-query';
import { ContentTypeNumber } from '../../collection.types';
import { getFragmentProperty } from '../../helpers/fragment';

import './FragmentDetail.scss';

interface FragmentDetailProps {
	collectionFragment: Avo.Collection.Fragment;
	showDescription: boolean;
	showMetadata: boolean;
	linkToItems: boolean;
	canPlay?: boolean;
}

/**
 * Renders the collection body with all of its fragments for the detail page
 * The bottom metadata is not included in the component
 * @param collectionFragment
 * @param showDescriptionNextToVideo
 * @constructor
 */
export const FragmentDetail: FC<FragmentDetailProps> = ({
	collectionFragment,
	showDescription,
	showMetadata,
	linkToItems,
}) => {
	if (get(collectionFragment, 'item_meta.type.label') === 'audio') {
		collectionFragment.thumbnail_path = DEFAULT_AUDIO_STILL;
	}

	const getTitleLink = (): string | undefined => {
		if (
			linkToItems &&
			collectionFragment.item_meta &&
			[ContentTypeNumber.video, ContentTypeNumber.audio].includes(
				collectionFragment.item_meta.type_id
			)
		) {
			return buildLink(APP_PATH.ITEM_DETAIL.route, {
				id: (collectionFragment.item_meta as Avo.Item.Item).external_id,
			});
		}
		return undefined;
	};

	return collectionFragment.item_meta ? (
		<ItemVideoDescription
			showDescription={showDescription}
			showMetadata={showMetadata}
			enableMetadataLink={false}
			showTitle
			itemMetaData={{
				...(collectionFragment.item_meta as Avo.Item.Item),
				thumbnail_path:
					collectionFragment.thumbnail_path ||
					(collectionFragment.item_meta as Avo.Item.Item).thumbnail_path,
			}}
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
			titleLink={getTitleLink()}
			cuePointsVideo={{
				start: collectionFragment.start_oc,
				end: collectionFragment.end_oc,
			}}
			cuePointsLabel={{
				start: collectionFragment.start_oc,
				end: collectionFragment.end_oc,
			}}
			verticalLayout={isMobileWidth()}
			trackPlayEvent={true}
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
