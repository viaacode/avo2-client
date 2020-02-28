import { get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { BlockMediaList, ButtonAction, MediaListItem } from '@viaa/avo2-components';

import { formatDate, navigateToContentType } from '../../../../shared/helpers';
import { MediaItemResponse } from '../../../shared/types';
import { fetchCollectionOrItem } from '../../services/block-data.service';

interface BlockMediaGridWrapperProps extends RouteComponentProps {
	ctaTitle?: string;
	ctaContent?: string;
	ctaButtonAction?: ButtonAction;
	ctaButtonLabel?: string;
	elements: { mediaItem: ButtonAction }[];
}

const BlockMediaGridWrapper: FunctionComponent<BlockMediaGridWrapperProps> = ({
	ctaTitle,
	ctaContent,
	ctaButtonAction = { type: 'COLLECTION', value: '' },
	ctaButtonLabel,
	elements = [],
	history,
}) => {
	// Hooks
	const [gridData, setGridData] = useState<MediaListItem[]>([]);

	const mapResponseData = useCallback(
		(action: ButtonAction, { tileData, count = 0 }: MediaItemResponse): MediaListItem => {
			const isItem = action.type === 'ITEM';
			const itemDuration = get(tileData, 'duration', 0);
			const itemLabel = get(tileData, 'type.label', 'item');
			const collectionItems = get(
				tileData,
				'collection_fragments_aggregate.aggregate.count',
				0
			);

			return {
				category: isItem ? itemLabel : 'collection',
				metadata: [
					{ icon: 'eye', label: String(count) },
					{ label: formatDate(tileData.created_at) },
				],
				navigate: () => navigateToContentType(action, history),
				title: tileData.title || '',
				thumbnail: {
					label: itemLabel,
					meta: isItem ? itemDuration : `${collectionItems} items`,
					src: tileData.thumbnail_path || '',
				},
			};
		},
		[history]
	);

	useEffect(() => {
		const mediaItems = elements.map(({ mediaItem }) => ({ ...mediaItem }));

		const fetchAndMapData = async () => {
			const newGridData: MediaListItem[] = [];

			for (let i = 0; i < mediaItems.length; i += 1) {
				const mediaItem = mediaItems[i];

				if (mediaItem.type && mediaItem.value) {
					const rawData = await fetchCollectionOrItem(mediaItem);

					if (rawData) {
						const cleanData = mapResponseData(mediaItem, rawData);

						newGridData.push(cleanData);
					}
				}
			}

			if (newGridData.length) {
				setGridData(newGridData);
			}
		};

		fetchAndMapData();
	}, [elements, mapResponseData]);

	// Render
	return (
		<BlockMediaList
			ctaButtonLabel={ctaButtonLabel}
			ctaContent={ctaContent}
			ctaNavigate={
				ctaButtonAction.value
					? () => navigateToContentType(ctaButtonAction, history)
					: () => {}
			}
			ctaTitle={ctaTitle}
			elements={gridData}
		/>
	);
};

export default withRouter(BlockMediaGridWrapper);
