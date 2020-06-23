import { get, isEmpty } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { BlockMediaList, ButtonAction, MediaListItem } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ContentTypeNumber } from '../../../../../collection/collection.types';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../../../shared/components';
import {
	CustomError,
	formatDate,
	isMobileWidth,
	navigateToContentType,
} from '../../../../../shared/helpers';
import { parseIntOrDefault } from '../../../../../shared/helpers/parsers/number';
import withUser, { UserProps } from '../../../../../shared/hocs/withUser';
import { ContentPageService } from '../../../../../shared/services/content-page-service';
import { MediaGridBlockComponentState, MediaGridBlockState } from '../../../../shared/types';

interface MediaGridWrapperProps extends MediaGridBlockState {
	searchQuery?: ButtonAction;
	searchQueryLimit: string;
	elements: { mediaItem: ButtonAction }[];
	results: (Partial<Avo.Item.Item> | Partial<Avo.Collection.Collection>)[];
}

const MediaGridWrapper: FunctionComponent<MediaGridWrapperProps &
	RouteComponentProps &
	UserProps> = ({
	title,
	buttonLabel,
	buttonAction,
	ctaTitle,
	ctaTitleColor,
	ctaTitleSize,
	ctaContent,
	ctaContentColor,
	ctaButtonLabel,
	ctaButtonType,
	ctaButtonIcon,
	ctaBackgroundColor,
	ctaBackgroundImage,
	ctaWidth,
	ctaButtonAction,
	searchQuery,
	searchQueryLimit,
	elements,
	results,
	history,
	user,
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
				return;
			}
			if (results && elements && !elements.length) {
				// Results is empty, but elements is also empty, so we don't need to render anything
				setResolvedResults(results);
				return;
			}
			if (user) {
				// If we are logged in and get no results, but we do get elements, then the block is loaded in preview mode,
				// and we should resolve the results ourselves using a separate route on the server
				setResolvedResults(
					await ContentPageService.resolveMediaItems(
						get(searchQuery, 'value') as string | undefined,
						parseIntOrDefault<undefined>(searchQueryLimit, undefined),
						elements.filter(element => !isEmpty(element) && element.mediaItem)
					)
				);
			}
		} catch (err) {
			setLoadingInfo({
				state: 'error',
				message: t(
					'admin/content-block/components/wrappers/media-grid-wrapper/media-grid-wrapper___het-laden-van-deze-media-tegel-grid-is-mislukt'
				),
				actionButtons: [],
			});
		}
	}, [
		results,
		elements,
		user,
		searchQuery,
		searchQueryLimit,
		setResolvedResults,
		setLoadingInfo,
		t,
	]);

	useEffect(() => {
		resolveMediaResults();
	}, [resolveMediaResults]);

	useEffect(() => {
		if (resolvedResults) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [resolvedResults]);

	const mapCollectionOrItemData = (
		itemOrCollection: Partial<Avo.Item.Item> | Partial<Avo.Collection.Collection>,
		index: number
	): MediaListItem => {
		const isItem =
			get(itemOrCollection, 'type.label') === 'video' ||
			get(itemOrCollection, 'type.label') === 'audio';
		const isCollection = get(itemOrCollection, 'type.id') === ContentTypeNumber.collection;
		const itemDuration = get(itemOrCollection, 'duration', 0);
		const itemLabel = get(itemOrCollection, 'type.label', 'item');
		const collectionItems = get(
			itemOrCollection,
			'collection_fragments_aggregate.aggregate.count',
			0
		); // TODO add fragment count to elasticsearch index
		const viewCount = get(itemOrCollection, 'view_counts_aggregate.aggregate.sum.count', 0);

		const element: MediaGridBlockComponentState = (elements || [])[index] || ({} as any);

		return {
			category: isItem ? itemLabel : 'collection',
			metadata: [
				{ icon: 'eye', label: String(viewCount) },
				{ label: formatDate(itemOrCollection.created_at) },
			],
			buttonLabel: element.buttonLabel,
			buttonType: element.buttonType,
			buttonIcon: element.buttonIcon,
			buttonAction:
				element.buttonAction || // Default link can be overridden by the user
				element.mediaItem ||
				({
					type: isItem ? 'ITEM' : isCollection ? 'COLLECTION' : 'BUNDLE',
					value: itemOrCollection.external_id,
					target: get(searchQuery, 'target') || '_self',
				} as ButtonAction),
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
				title={title}
				buttonLabel={buttonLabel}
				buttonAction={buttonAction || searchQuery}
				ctaTitle={ctaTitle}
				ctaTitleColor={ctaTitleColor}
				ctaTitleSize={ctaTitleSize}
				ctaContent={ctaContent}
				ctaContentColor={ctaContentColor}
				ctaButtonLabel={ctaButtonLabel}
				ctaButtonType={ctaButtonType}
				ctaButtonIcon={ctaButtonIcon}
				ctaBackgroundColor={ctaBackgroundColor}
				ctaBackgroundImage={ctaBackgroundImage}
				ctaWidth={ctaWidth}
				ctaButtonAction={ctaButtonAction}
				fullWidth={isMobileWidth()}
				elements={(resolvedResults || []).map(mapCollectionOrItemData)}
				navigate={(buttonAction: any) =>
					buttonAction
						? navigateToContentType(buttonAction, history)
						: () => {
								console.error(
									new CustomError(
										'Failed to navigate because button action is undefined'
									)
								);
						  }
				}
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

export default compose(withRouter, withUser)(MediaGridWrapper) as FunctionComponent<
	MediaGridWrapperProps
>;
