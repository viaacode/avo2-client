import {
	BlockMediaGrid,
	MediaGridBlockComponentState,
	MediaGridBlockState,
	MediaListItem,
} from '@meemoo/admin-core-ui';
import {
	ButtonAction,
	IconName,
	Modal,
	ModalBody,
	RenderLinkFunction,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { isEmpty, isNil } from 'lodash-es';
import React, { FunctionComponent, ReactNode, useCallback, useEffect, useState } from 'react';

import { ContentPageService } from '../../../admin/content-page/services/content-page.service';
import { ContentTypeString, toEnglishContentType } from '../../../collection/collection.types';
import { APP_PATH } from '../../../constants';
import { ItemVideoDescription } from '../../../item/components';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { DEFAULT_AUDIO_STILL } from '../../../shared/constants';
import { buildLink, CustomError, formatDate, isMobileWidth } from '../../../shared/helpers';
import { defaultRenderBookmarkButton } from '../../../shared/helpers/default-render-bookmark-button';
import { parseIntOrDefault } from '../../../shared/helpers/parsers/number';
import useTranslation from '../../../shared/hooks/useTranslation';
import { BookmarksViewsPlaysService } from '../../../shared/services/bookmarks-views-plays-service';
import { ToastService } from '../../../shared/services/toast-service';

import { ResolvedItemOrCollection } from './MediaGridWrapper.types';

interface MediaGridWrapperProps extends MediaGridBlockState {
	searchQuery?: ButtonAction;
	searchQueryLimit: string;
	elements: { mediaItem: ButtonAction }[];
	results: ResolvedItemOrCollection[];
	renderLink: RenderLinkFunction;
	buttonAltTitle?: string;
	ctaButtonAltTitle?: string;
	commonUser: Avo.User.CommonUser;
}

const MediaGridWrapper: FunctionComponent<MediaGridWrapperProps> = ({
	title,
	buttonLabel,
	buttonAltTitle,
	buttonAction,
	ctaTitle,
	ctaTitleColor,
	ctaTitleSize,
	ctaContent,
	ctaContentColor,
	ctaButtonLabel,
	ctaButtonAltTitle,
	ctaButtonType,
	ctaButtonIcon,
	ctaBackgroundColor,
	ctaBackgroundImage,
	ctaWidth,
	openMediaInModal = false,
	ctaButtonAction,
	searchQuery,
	searchQueryLimit,
	elements,
	results,
	commonUser,
	renderLink,
}: any) => {
	// TODO remove any when typings for admin-core-ui is fixed
	const { tText, tHtml } = useTranslation();

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [resolvedResults, setResolvedResults] = useState<ResolvedItemOrCollection[] | null>(null);

	// cache search results
	const [lastSearchQuery, setLastSearchQuery] = useState<string | null>(null);
	const [lastSearchQueryLimit, setLastSearchQueryLimit] = useState<number | null>(null);

	const [activeItem, setActiveItem] = useState<(Avo.Item.Item & ResolvedItemOrCollection) | null>(
		null
	);
	const [activeItemBookmarkStatus, setActiveItemBookmarkStatus] = useState<boolean | null>(null);

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
			if (commonUser) {
				// If we are logged in and get no results, but we do get elements, then the block is loaded in preview mode,
				// and we should resolve the results ourselves using a separate route on the server
				const searchQueryLimitNumber =
					parseIntOrDefault<undefined>(searchQueryLimit, undefined) || 8;
				const searchQueryValue: string | null =
					(searchQuery?.value as string | undefined) || null;

				if (
					(elements && elements.length && isNil(searchQueryValue)) ||
					searchQueryValue !== lastSearchQuery ||
					searchQueryLimitNumber > (lastSearchQueryLimit || 0)
				) {
					// Only fetch items from the server if
					// - the manually selected elements changed without a search query being set or
					// - the search query changed or
					// - if the number of items increased
					setLastSearchQuery(searchQueryValue || null);
					setLastSearchQueryLimit(searchQueryLimitNumber);
					const searchResults = await ContentPageService.resolveMediaItems(
						searchQueryValue,
						searchQueryLimitNumber,
						elements.filter(
							(element: { mediaItem: ButtonAction }) =>
								!isEmpty(element) && element.mediaItem
						)
					);

					setResolvedResults((r) => {
						if (
							!isNil(searchQueryValue) &&
							r &&
							r.length &&
							searchResults.length !== (searchQueryLimitNumber || 8)
						) {
							// older request that we should ignore
							return r;
						}
						return searchResults;
					});
				} else if (
					searchQueryValue === lastSearchQuery ||
					searchQueryLimitNumber < (lastSearchQueryLimit || 0)
				) {
					// If the next query requests fewer items, we can resolve it without going to the server
					// by just trimming the items in the cache
					setResolvedResults((r) => (r || []).slice(0, searchQueryLimitNumber));
					setLastSearchQueryLimit(searchQueryLimitNumber);
				}
			}
		} catch (err) {
			setLoadingInfo({
				state: 'error',
				message: tHtml(
					'admin/content-block/components/wrappers/media-grid-wrapper/media-grid-wrapper___het-laden-van-deze-media-tegel-grid-is-mislukt'
				),
				actionButtons: [],
			});
		}
	}, [
		results,
		elements,
		commonUser,
		searchQuery,
		searchQueryLimit,
		lastSearchQuery,
		lastSearchQueryLimit,
		setResolvedResults,
		setLoadingInfo,
		tHtml,
	]);

	useEffect(() => {
		resolveMediaResults();
	}, [resolveMediaResults]);

	useEffect(() => {
		if (resolvedResults) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [resolvedResults]);

	const fetchActiveItemBookmarkStatus = useCallback(async () => {
		if (!commonUser || !activeItem) {
			return;
		}
		const statuses = await BookmarksViewsPlaysService.getBookmarkStatuses(
			commonUser.profileId,
			[
				{
					type: 'item',
					uuid: activeItem.uid,
				},
			]
		);
		setActiveItemBookmarkStatus(statuses['item'][activeItem.uid]);
	}, [activeItem?.external_id]);

	useEffect(() => {
		fetchActiveItemBookmarkStatus();
	}, [fetchActiveItemBookmarkStatus]);

	const toggleBookmark = async () => {
		if (!commonUser || !activeItem || isNil(activeItemBookmarkStatus)) {
			return;
		}
		try {
			await BookmarksViewsPlaysService.toggleBookmark(
				activeItem.uid,
				commonUser,
				'item',
				activeItemBookmarkStatus
			);

			setActiveItemBookmarkStatus(!activeItemBookmarkStatus);
			ToastService.success(
				activeItemBookmarkStatus
					? tText('De bladwijzer is verwijderd')
					: tText('De bladwijzer is aangemaakt')
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to toggle bookmark', err, {
					commonUser,
					itemId: activeItem.uid,
					type: 'item',
					activeItemBookmarkStatus,
				})
			);
			ToastService.danger(
				activeItemBookmarkStatus
					? tText('Het verwijderen van de bladwijzer is mislukt')
					: tText('Het aanmaken van de bladwijzer is mislukt')
			);
		}
	};

	const getThumbnailFromItem = (itemOrCollection: ResolvedItemOrCollection) => {
		if (itemOrCollection.type?.label === 'audio') {
			return DEFAULT_AUDIO_STILL;
		}
		return itemOrCollection?.thumbnail_path || '';
	};

	const mapCollectionOrItemData = (
		itemOrCollection: ResolvedItemOrCollection,
		index: number
	): MediaListItem => {
		const itemLabel = itemOrCollection?.type?.label || 'item';
		const isItem =
			itemLabel === ContentTypeString.video || itemLabel === ContentTypeString.audio;
		const isCollection = itemLabel === ContentTypeString.collection;
		const itemDuration = (itemOrCollection as Avo.Item.Item)?.duration || 0;
		const collectionItems =
			(itemOrCollection as Avo.Collection.Collection)?.collection_fragments_aggregate
				?.aggregate?.count || 0; // TODO add fragment count to elasticsearch index
		const viewCount = itemOrCollection?.view_counts_aggregate?.aggregate?.sum?.count || 0;

		const element: MediaGridBlockComponentState = (elements || [])[index] || ({} as any);

		return {
			category: isItem
				? itemLabel
				: isCollection
				? toEnglishContentType(ContentTypeString.collection)
				: toEnglishContentType(ContentTypeString.bundle),
			metadata: [
				{ icon: IconName.eye, label: String(viewCount || 0) },
				{ label: formatDate(itemOrCollection?.created_at) },
			],
			buttonLabel: element.buttonLabel,
			buttonAltTitle: element.buttonAltTitle,
			buttonType: element.buttonType,
			buttonIcon: element.buttonIcon,
			itemAction:
				element.mediaItem ||
				({
					type: isItem ? 'ITEM' : isCollection ? 'COLLECTION' : 'BUNDLE',
					value: itemOrCollection?.external_id || itemOrCollection?.id,
					target: searchQuery?.target || '_self',
				} as ButtonAction),
			buttonAction: element.buttonAction,
			title: itemOrCollection?.title || '',
			description: itemOrCollection?.description || '',
			issued: (itemOrCollection as Avo.Item.Item)?.issued || '',
			organisation: itemOrCollection?.organisation || '',
			thumbnail: {
				label: itemLabel,
				meta: isItem
					? itemDuration
					: `${collectionItems} ${isCollection ? 'items' : 'collecties'}`,
				src: getThumbnailFromItem(itemOrCollection),
			},
			src: itemOrCollection?.src,
			item_collaterals: (itemOrCollection as Avo.Item.Item)?.item_collaterals || null,
		} as any;
	};

	const openInModal = (mediaListItem: MediaListItem): boolean => {
		return openMediaInModal && mediaListItem?.itemAction?.type === 'ITEM';
	};

	const renderMediaCardWrapper = (mediaCard: ReactNode, item: MediaListItem) => {
		if (openInModal(item)) {
			return (
				<a
					onClick={() =>
						setActiveItem(
							(resolvedResults?.find((resultItem) => resultItem.src === item.src) ||
								null) as Avo.Item.Item | null
						)
					}
				>
					{mediaCard}
				</a>
			);
		}
		return renderLink(item.itemAction, mediaCard, item.buttonAltTitle || item.title);
	};

	const renderBookmarkButton = (): ReactNode => {
		if (!commonUser || isNil(activeItemBookmarkStatus)) {
			return null;
		}
		return defaultRenderBookmarkButton({
			active: activeItemBookmarkStatus,
			ariaLabel: tText('Toggle bladwijzer'),
			title: tText('Toggle bladwijzer'),
			onClick: toggleBookmark,
		});
	};

	// Render
	const renderMediaGridBlock = () => {
		const elements = (resolvedResults || []).map(mapCollectionOrItemData);
		return (
			<>
				<BlockMediaGrid
					title={title}
					buttonLabel={buttonLabel}
					buttonAltTitle={buttonAltTitle}
					buttonAction={buttonAction || searchQuery}
					ctaTitle={ctaTitle}
					ctaTitleColor={ctaTitleColor}
					ctaTitleSize={ctaTitleSize}
					ctaContent={ctaContent}
					ctaContentColor={ctaContentColor}
					ctaButtonLabel={ctaButtonLabel}
					ctaButtonAltTitle={ctaButtonAltTitle}
					ctaButtonType={ctaButtonType}
					ctaButtonIcon={ctaButtonIcon}
					ctaBackgroundColor={ctaBackgroundColor}
					ctaBackgroundImage={ctaBackgroundImage}
					ctaWidth={ctaWidth}
					ctaButtonAction={ctaButtonAction}
					fullWidth={isMobileWidth()}
					elements={elements}
					renderLink={renderLink}
					renderMediaCardWrapper={renderMediaCardWrapper}
				/>
				<Modal
					isOpen={!!activeItem}
					onClose={() => {
						setActiveItem(null);
						setActiveItemBookmarkStatus(null);
					}}
					scrollable
					size="medium"
				>
					<ModalBody>
						{!!activeItem && !!activeItem.src && (
							<ItemVideoDescription
								src={activeItem.src}
								poster={(activeItem as Avo.Item.Item)?.thumbnail_path}
								itemMetaData={activeItem as unknown as Avo.Item.Item}
								verticalLayout
								showTitle
								titleLink={buildLink(APP_PATH.ITEM_DETAIL.route, {
									id: activeItem.external_id,
								})}
								collapseDescription={false}
								renderButtons={renderBookmarkButton}
							/>
						)}
					</ModalBody>
				</Modal>
			</>
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

export default MediaGridWrapper;
