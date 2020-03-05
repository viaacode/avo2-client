import { get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import {
	BlockMediaList,
	ButtonAction,
	ContentPickerType,
	MediaListItem,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { toEnglishContentType } from '../../../../../collection/collection.types';
import {
	CustomError,
	formatDate,
	formatDurationHoursMinutesSeconds,
	navigateToContentType,
} from '../../../../../shared/helpers';
import { MediaItemResponse } from '../../../../shared/types';

import { fetchCollectionOrItem, fetchSearchQuery } from '../../../services/block-data.service';

interface MediaGridWrapperProps extends RouteComponentProps {
	ctaTitle?: string;
	ctaContent?: string;
	ctaButtonAction?: ButtonAction;
	ctaButtonLabel?: string;
	elements: { mediaItem: ButtonAction }[];
	searchQuery?: ButtonAction;
	searchQueryLimit?: number;
}

const MediaGridWrapper: FunctionComponent<MediaGridWrapperProps> = ({
	ctaTitle,
	ctaContent,
	ctaButtonAction = { type: 'COLLECTION', value: '' },
	ctaButtonLabel,
	elements = [],
	history,
	searchQuery,
	searchQueryLimit = 8,
}) => {
	// Hooks
	const [gridData, setGridData] = useState<MediaListItem[]>([]);
	const [queryData, setQueryData] = useState<MediaListItem[]>([]);

	const mapCollectionOrItemData = useCallback(
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

	const mapSearchData = useCallback(
		(searchData: Avo.Search.Search): MediaListItem[] => {
			if (searchData.results.length > 0) {
				return searchData.results.map(searchItem => {
					const category = toEnglishContentType(searchItem.administrative_type);
					const isItem = ['audio', 'video'].includes(category);
					const duration = formatDurationHoursMinutesSeconds(
						get(searchItem, 'duration_seconds', 0)
					);

					return {
						category,
						metadata: [
							{ icon: 'eye', label: String(searchItem.views_count) },
							{ label: formatDate(searchItem.dcterms_issued) },
						],
						navigate: () =>
							navigateToContentType(
								{
									type: isItem
										? 'ITEM'
										: (category.toUpperCase() as ContentPickerType),
									value: searchItem.external_id,
								},
								history
							),
						title: searchItem.dc_title,
						thumbnail: {
							label: searchItem.administrative_type,
							meta: isItem ? duration : '', // Amount of items in collection not present in search
							src: searchItem.thumbnail_path || '',
						},
					};
				});
			}

			return [];
		},
		[history]
	);

	useEffect(() => {
		const fetchQueryAndMapData = async () => {
			if (searchQuery && searchQuery.value) {
				let valueObj;

				// Wre have to wrap JSON.parse in this try..catch because if the value is cleared
				// it returns an invalid JSON string which causes a crash
				try {
					valueObj = JSON.parse(searchQuery.value as string);
				} catch (err) {
					console.error(new CustomError('Failed to parse search query value', err));
				}

				const filters: Partial<Avo.Search.Filters> | undefined = get(valueObj, 'filters');
				const rawData = await fetchSearchQuery(searchQueryLimit, filters);

				if (rawData) {
					const cleanData = mapSearchData(rawData);
					setQueryData(cleanData);
				}
			}
		};

		fetchQueryAndMapData();
	}, [mapSearchData, searchQuery, searchQueryLimit]);

	useEffect(() => {
		const mediaItems = elements.map(({ mediaItem }) => ({ ...mediaItem }));

		const fetchAndMapData = async () => {
			const newGridData: MediaListItem[] = [];

			for (let i = 0; i < mediaItems.length; i += 1) {
				const mediaItem = mediaItems[i];

				if (mediaItem.type && mediaItem.value) {
					const rawData = await fetchCollectionOrItem(mediaItem);

					if (rawData) {
						const cleanData = mapCollectionOrItemData(mediaItem, rawData);

						newGridData.push(cleanData);
					}
				}
			}

			if (newGridData.length) {
				setGridData(newGridData);
			}
		};

		fetchAndMapData();
	}, [elements, mapCollectionOrItemData]);

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
			elements={queryData.concat(gridData)}
		/>
	);
};

export default withRouter(MediaGridWrapper);
