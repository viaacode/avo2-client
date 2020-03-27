import { get, isEmpty } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { BlockMediaList, ButtonAction, MediaListItem } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { toEnglishContentType } from '../../../../../collection/collection.types';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../../../shared/components';
import { formatDate, navigateToContentType } from '../../../../../shared/helpers';
import { parseIntOrDefault } from '../../../../../shared/helpers/parsers/number';
import { ContentPageService } from '../../../../../shared/services/content-page-service';
import { MediaGridBlockState } from '../../../../shared/types';

interface MediaGridWrapperProps extends MediaGridBlockState, RouteComponentProps {
	searchQuery?: ButtonAction;
	searchQueryLimit: string;
	elements: { mediaItem: ButtonAction }[];
	results: (Partial<Avo.Item.Item> | Partial<Avo.Collection.Collection>)[];
}

const MediaGridWrapper: FunctionComponent<MediaGridWrapperProps> = ({
	ctaTitle,
	ctaContent,
	ctaButtonAction = { type: 'COLLECTION', value: '' },
	ctaButtonLabel,
	searchQuery,
	searchQueryLimit,
	elements,
	results,
	history,
}) => {
	const [t] = useTranslation();

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [resolvedResults, setResolvedResults] = useState<
		(Partial<Avo.Item.Item> | Partial<Avo.Collection.Collection>)[] | null
	>(null);

	const resolveMediaResults = useCallback(async () => {
		try {
			if (results && results.length) {
				// Results are filled in, we can render the block
				setResolvedResults(results);
			}
			if (results && elements && !elements.length) {
				// Results is empty, but elements is also empty, so we don't need to render anything
				setResolvedResults(results);
			}
			// If we get no results, but we do get elements, then the block is loaded in preview mode,
			// and we should resolve the results ourselves using a separate route on the server
			setResolvedResults(
				await ContentPageService.resolveMediaItems(
					get(searchQuery, 'value') as string | undefined,
					parseIntOrDefault<undefined>(searchQueryLimit, undefined),
					elements.filter(element => !isEmpty(element))
				)
			);
		} catch (err) {
			setLoadingInfo({
				state: 'error',
				message: t('Het laden van deze media tegel grid is mislukt'),
				actionButtons: [],
			});
		}
	}, [results, elements, searchQuery, searchQueryLimit, setResolvedResults, setLoadingInfo, t]);

	useEffect(() => {
		resolveMediaResults();
	}, [resolveMediaResults]);

	useEffect(() => {
		if (resolvedResults) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [resolvedResults]);

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
	const renderMediaGridBlock = () => {
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
				elements={(resolvedResults || []).map(mapCollectionOrItemData)}
			/>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={resolvedResults}
			render={renderMediaGridBlock}
		/>
	);
};

export default withRouter(MediaGridWrapper);
