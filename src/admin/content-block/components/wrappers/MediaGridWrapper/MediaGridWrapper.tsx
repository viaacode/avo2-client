import { get } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { BlockMediaList, ButtonAction, MediaListItem } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { toEnglishContentType } from '../../../../../collection/collection.types';
import { formatDate, navigateToContentType } from '../../../../../shared/helpers';

interface MediaGridWrapperProps extends RouteComponentProps {
	ctaTitle?: string;
	ctaContent?: string;
	ctaButtonAction?: ButtonAction;
	ctaButtonLabel?: string;
	results: (Partial<Avo.Item.Item> | Partial<Avo.Collection.Collection>)[];
}

const MediaGridWrapper: FunctionComponent<MediaGridWrapperProps> = props => {
	const {
		ctaTitle,
		ctaContent,
		ctaButtonAction = { type: 'COLLECTION', value: '' },
		ctaButtonLabel,
		results,
		history,
	} = props;
	const mapCollectionOrItemData = (
		itemOrCollection: Partial<Avo.Item.Item> | Partial<Avo.Collection.Collection>
	): MediaListItem => {
		const isItem =
			get(itemOrCollection, 'type.label') === 'video' ||
			get(itemOrCollection, 'type.label') === 'audio';
		const itemDuration = get(itemOrCollection, 'duration', 0);
		const itemLabel = get(itemOrCollection, 'type.label', 'item');
		const collectionItems = get(
			itemOrCollection,
			'collection_fragments_aggregate.aggregate.count',
			0
		); // TODO add fragment count to elasticsearch index
		const viewCount = get(itemOrCollection, 'view_counts_aggregate.aggregate.count', 0);

		return {
			category: isItem ? itemLabel : 'collection',
			metadata: [
				{ icon: 'eye', label: String(viewCount) },
				{ label: formatDate(itemOrCollection.created_at) },
			],
			navigate: () =>
				navigateToContentType(
					{
						type: (isItem
							? 'ITEM'
							: toEnglishContentType(
									get(itemOrCollection, 'type.label')
							  ).toUpperCase()) as Avo.Core.ContentPickerType,
						value: (isItem
							? itemOrCollection.external_id
							: itemOrCollection.id) as string,
					},
					history
				),
			title: itemOrCollection.title || '',
			thumbnail: {
				label: itemLabel,
				meta: isItem ? itemDuration : `${collectionItems} items`,
				src: itemOrCollection.thumbnail_path || '',
			},
		};
	};

	// Render
	return (
		<BlockMediaList
			ctaButtonLabel={ctaButtonLabel}
			ctaContent={ctaContent}
			ctaNavigate={
				ctaButtonAction.value
					? () => navigateToContentType(ctaButtonAction as any, history)
					: () => {}
			}
			ctaTitle={ctaTitle}
			elements={(results || []).map(mapCollectionOrItemData)}
		/>
	);
};

export default withRouter(MediaGridWrapper);
