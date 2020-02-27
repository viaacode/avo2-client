import { get, isEqual } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import {
	ButtonAction,
	Column,
	CTA,
	EnglishContentType,
	Grid,
	MediaCard,
	MediaCardMetaData,
	MediaCardThumbnail,
	MetaData,
	MetaDataItem,
	Orientation,
	Thumbnail,
} from '@viaa/avo2-components';
import { MetaDataItemProps } from '@viaa/avo2-components/dist/components/MetaData/MetaDataItem/MetaDataItem';

import { formatDate, navigateToContentType } from '../../../../shared/helpers';
import { MediaItemResponse } from '../../../shared/types';
import { fetchCollectionOrItem } from '../../services/block-data.service';

import './BlockMediaList.scss';

export type MediaListItem = {
	action: ButtonAction;
	category: EnglishContentType;
	metadata?: MetaDataItemProps[];
	thumbnail?: { label: string; meta?: string; src?: string };
	title: string;
};

export interface BlockMediaListProps {
	elements: MediaListItem[];
	navigate: (action: ButtonAction) => void;
	orientation?: Orientation;
	ctaTitle?: string;
	ctaContent?: string;
	ctaButtonAction?: ButtonAction;
	ctaButtonLabel?: string;
}

// TODO: everything related to BlockMediaList once it has been updated in components lib
export const BlockMediaList: FunctionComponent<BlockMediaListProps> = ({
	elements = [],
	navigate,
	orientation,
	ctaTitle = '',
	ctaContent = '',
	ctaButtonAction = { type: 'COLLECTION', value: '' },
	ctaButtonLabel = '',
}) => {
	return (
		<div className="c-block-media-list c-media-card-list">
			<Grid>
				{elements.map(({ action, category, metadata, thumbnail, title }, i) => (
					<Column key={`block-media-list-${i}`} size="3-3">
						<MediaCard
							category={category}
							onClick={() => navigate(action)}
							orientation={orientation}
							title={title}
						>
							{thumbnail && (
								<MediaCardThumbnail>
									<Thumbnail alt={title} category={category} {...thumbnail} />
								</MediaCardThumbnail>
							)}
							{metadata && metadata.length > 0 && (
								<MediaCardMetaData>
									<MetaData category={category}>
										{metadata.map((props, i) => (
											<MetaDataItem
												key={`block-media-list-meta-${i}`}
												{...props}
											/>
										))}
									</MetaData>
								</MediaCardMetaData>
							)}
						</MediaCard>
					</Column>
				))}
				{(ctaTitle || ctaButtonAction.value || ctaButtonLabel) && (
					<Column size="3-3">
						<CTA
							buttonAction={ctaButtonAction}
							buttonLabel={ctaButtonLabel}
							heading={ctaTitle}
							content={ctaContent}
							headingType="h3"
							navigate={navigate}
						/>
					</Column>
				)}
			</Grid>
		</div>
	);
};

interface BlockMediaListWrapperProps extends RouteComponentProps {
	ctaTitle?: string;
	ctaContent?: string;
	ctaButtonAction?: ButtonAction;
	ctaButtonLabel?: string;
	elements: { mediaItem: ButtonAction }[];
}

const BlockMediaListWrapper: FunctionComponent<BlockMediaListWrapperProps> = ({
	ctaTitle,
	ctaContent,
	ctaButtonAction,
	ctaButtonLabel,
	elements = [],
	history,
}) => {
	// Hooks
	const [data, setData] = useState<MediaListItem[]>([]);

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
				action,
				category: isItem ? itemLabel : 'collection',
				metadata: [
					{ icon: 'eye', label: String(count) },
					{ label: formatDate(tileData.created_at) },
				],
				title: tileData.title || '',
				thumbnail: {
					label: itemLabel,
					meta: isItem ? itemDuration : `${collectionItems} items`,
					src: tileData.thumbnail_path || '',
				},
			};
		},
		[]
	);

	useEffect(() => {
		const mediaItems = elements.map(({ mediaItem }) => ({ ...mediaItem }));

		const fetchAndMapData = async () => {
			const dataArray: any[] = [];

			for (let i = 0; i < mediaItems.length; i += 1) {
				const mediaItem = mediaItems[i];

				if (mediaItem.type && mediaItem.value) {
					const rawData = await fetchCollectionOrItem(mediaItem);

					if (rawData) {
						const cleanData = mapResponseData(mediaItem, rawData);

						dataArray.push(cleanData);
					}
				}
			}

			if (dataArray.length && !isEqual(data, dataArray)) {
				setData(dataArray);
			}
		};

		fetchAndMapData();
	}, [data, elements, mapResponseData]);

	// Render
	return (
		<BlockMediaList
			elements={data}
			navigate={action => navigateToContentType(action, history)}
			ctaTitle={ctaTitle}
			ctaContent={ctaContent}
			ctaButtonAction={ctaButtonAction}
			ctaButtonLabel={ctaButtonLabel}
		/>
	);
};

export default withRouter(BlockMediaListWrapper);
