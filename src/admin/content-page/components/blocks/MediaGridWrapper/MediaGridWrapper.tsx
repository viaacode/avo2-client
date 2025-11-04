import {
	type MediaGridBlockComponentState,
	type MediaGridBlockState,
} from '@meemoo/admin-core-ui/admin';
import type { DbContentPage } from '@meemoo/admin-core-ui/client';
import {
	Button,
	type ButtonAction,
	IconName,
	Modal,
	ModalBody,
	type RenderLinkFunction,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { useAtomValue } from 'jotai';
import { compact, isEmpty, isNil } from 'lodash-es';
import React, { type FC, type ReactNode, useCallback, useEffect, useState } from 'react';

import placeholderImage from '../../../../../assets/images/assignment-placeholder.png';
import { commonUserAtom } from '../../../../../authentication/authentication.store';
import {
	CONTENT_TYPE_TRANSLATIONS,
	ContentTypeString,
} from '../../../../../collection/collection.types';
import { APP_PATH } from '../../../../../constants';
import { ItemVideoDescription } from '../../../../../item/components/ItemVideoDescription';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../../../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { DEFAULT_AUDIO_STILL } from '../../../../../shared/constants';
import { buildLink } from '../../../../../shared/helpers/build-link';
import { CustomError } from '../../../../../shared/helpers/custom-error';
import { defaultRenderBookmarkButton } from '../../../../../shared/helpers/default-render-bookmark-button';
import { formatDate } from '../../../../../shared/helpers/formatters/date';
import { isMobileWidth } from '../../../../../shared/helpers/media-query';
import { parseIntOrDefault } from '../../../../../shared/helpers/parsers/number';
import { useTranslation } from '../../../../../shared/hooks/useTranslation';
import { BookmarksViewsPlaysService } from '../../../../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service';
import { ToastService } from '../../../../../shared/services/toast-service';
import { ADMIN_PATH } from '../../../../admin.const';
import { ContentPageService } from '../../../services/content-page.service';

import { BlockMediaGrid, type MediaListItem } from './BlockMediaGrid';
import { type ResolvedItemOrCollectionOrAssignmentOrContentPage } from './MediaGridWrapper.types';

interface MediaGridWrapperProps extends MediaGridBlockState {
	searchQuery?: ButtonAction;
	searchQueryLimit: string;
	elements: {
		mediaItem: ButtonAction;
		copyrightOwnerOrId: string | 'NO_COPYRIGHT_NOTICE';
	}[];
	results: ResolvedItemOrCollectionOrAssignmentOrContentPage[];
	renderLink: RenderLinkFunction;
	buttonAltTitle?: string;
	ctaButtonAltTitle?: string;
}

export const MediaGridWrapper: FC<MediaGridWrapperProps> = ({
	title,
	titleType = 'h2',
	buttonLabel,
	buttonAltTitle,
	buttonAction,
	ctaTitle,
	ctaTitleColor,
	ctaTitleSize,
	ctaTitleBackgroundColor,
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
	renderLink,
}: any) => {
	// TODO remove any when typings for admin-core-ui is fixed
	const { tText, tHtml } = useTranslation();

	const commonUser = useAtomValue(commonUserAtom);

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [resolvedResults, setResolvedResults] = useState<
		ResolvedItemOrCollectionOrAssignmentOrContentPage[] | null
	>(null);

	// cache search results
	const [lastSearchQuery, setLastSearchQuery] = useState<string | null>(null);
	const [lastSearchQueryLimit, setLastSearchQueryLimit] = useState<number | null>(null);

	const [activeItem, setActiveItem] = useState<
		(Avo.Item.Item & ResolvedItemOrCollectionOrAssignmentOrContentPage) | null
	>(null);
	const [activeItemBookmarkStatus, setActiveItemBookmarkStatus] = useState<boolean | null>(null);
	const [activeCopyright, setActiveCopyright] = useState<Avo.Organization.Organization | null>(
		null
	);

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
			console.error(err);
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
					? tText(
							'search/components/media-grid-wrapper/media-grid-wrapper___de-bladwijzer-is-verwijderd'
					  )
					: tText(
							'search/components/media-grid-wrapper/media-grid-wrapper___de-bladwijzer-is-aangemaakt'
					  )
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
					? tText(
							'search/components/media-grid-wrapper/media-grid-wrapper___het-verwijderen-van-de-bladwijzer-is-mislukt'
					  )
					: tText(
							'search/components/media-grid-wrapper/media-grid-wrapper___het-aanmaken-van-de-bladwijzer-is-mislukt'
					  )
			);
		}
	};

	const getThumbnailFromItem = (
		itemOrCollectionOrAssignment: ResolvedItemOrCollectionOrAssignmentOrContentPage | null
	) => {
		if (itemOrCollectionOrAssignment?.type?.label === 'audio') {
			return DEFAULT_AUDIO_STILL;
		}
		if (itemOrCollectionOrAssignment?.type?.label === 'opdracht') {
			return (
				(itemOrCollectionOrAssignment as Avo.Assignment.Assignment)?.thumbnail_path ||
				placeholderImage
			);
		}
		return (itemOrCollectionOrAssignment as Avo.Item.Item)?.thumbnail_path || '';
	};

	const getLabelFromItem = (
		itemOrCollectionOrAssignment: ResolvedItemOrCollectionOrAssignmentOrContentPage | null
	): string => {
		if ((itemOrCollectionOrAssignment as any)?.type?.label) {
			return (itemOrCollectionOrAssignment as any)?.type?.label;
		}

		if ((itemOrCollectionOrAssignment as any)?.content_type) {
			return 'contentPagina';
		}

		return 'item';
	};

	const ITEM_LABEL_TO_TYPE: Partial<Record<ContentTypeString, Avo.Core.ContentPickerType>> = {
		video: 'ITEM',
		audio: 'ITEM',
		collectie: 'COLLECTION',
		bundel: 'BUNDLE',
		opdracht: 'ASSIGNMENT',
		contentPagina: 'CONTENT_PAGE',
	};

	const getThumbnailMetadata = (itemOrCollectionOrAssignment: any): string | null => {
		const itemLabel = getLabelFromItem(itemOrCollectionOrAssignment);
		const itemDuration = String((itemOrCollectionOrAssignment as Avo.Item.Item)?.duration || 0);
		const collectionItems =
			(itemOrCollectionOrAssignment as Avo.Collection.Collection)?.item_count || 0;

		return (
			{
				item: itemDuration,
				video: itemDuration,
				audio: itemDuration,
				collectie: `${collectionItems} ${
					collectionItems === 1
						? tText('search/components/media-grid-wrapper/media-grid-wrapper___item')
						: tText('search/components/media-grid-wrapper/media-grid-wrapper___items')
				}`,
				// Do not show number of collections since a bundle can contain collections and assignments now
				// https://meemoo.atlassian.net/browse/AVO-3828
				bundel: null,
				opdracht: null,
				contentPagina: null,
			}[itemLabel] || null
		);
	};

	const handleCopyrightClicked = (
		evt: React.MouseEvent<HTMLElement, MouseEvent>,
		orgInfo: Avo.Organization.Organization
	) => {
		evt.stopPropagation();
		evt.preventDefault();
		setActiveCopyright(orgInfo);
	};

	const mapItemOrCollectionOrAssignmentOrBundleOrPageData = (
		itemOrCollectionOrAssignmentOrPage: ResolvedItemOrCollectionOrAssignmentOrContentPage,
		index: number
	): MediaListItem => {
		const itemLabel = getLabelFromItem(itemOrCollectionOrAssignmentOrPage);
		const viewCount = itemOrCollectionOrAssignmentOrPage?.view_count || 0;

		const element: MediaGridBlockComponentState = (elements || [])[index] || ({} as any);

		// Show copy right notice when the block requires it and the user is not logged in, or when they are editing the content page (preview)
		// https://meemoo.atlassian.net/browse/AVO-3015
		const showCopyrightNotice =
			!!itemOrCollectionOrAssignmentOrPage.copyright_organisation &&
			(!commonUser || location.pathname.startsWith(ADMIN_PATH.DASHBOARD));
		const createdAt =
			(
				itemOrCollectionOrAssignmentOrPage as
					| Avo.Item.Item
					| Avo.Collection.Collection
					| Avo.Assignment.Assignment
			)?.created_at || (itemOrCollectionOrAssignmentOrPage as DbContentPage)?.createdAt;

		return {
			category: CONTENT_TYPE_TRANSLATIONS[itemLabel],
			subCategory: (itemOrCollectionOrAssignmentOrPage as any).content_type,
			metadata:
				itemLabel === ContentTypeString.contentPage
					? []
					: [
							...(itemLabel !== ContentTypeString.assignment
								? [{ icon: IconName.eye, label: String(viewCount || 0) }]
								: []),
							{ label: formatDate(createdAt) },
					  ],
			buttonLabel: element.buttonLabel,
			buttonAltTitle: element.buttonAltTitle,
			buttonType: element.buttonType,
			buttonIcon: element.buttonIcon,
			itemAction:
				element.mediaItem ||
				({
					type: ITEM_LABEL_TO_TYPE[itemLabel as ContentTypeString],
					value:
						(
							itemOrCollectionOrAssignmentOrPage as
								| Avo.Item.Item
								| Avo.Collection.Collection
						)?.external_id ||
						(itemOrCollectionOrAssignmentOrPage as DbContentPage)?.path ||
						itemOrCollectionOrAssignmentOrPage?.id,
					target: searchQuery?.target || '_self',
				} as ButtonAction),
			buttonAction: element.buttonAction,
			title:
				itemOrCollectionOrAssignmentOrPage?.media_item_label ||
				itemOrCollectionOrAssignmentOrPage?.title ||
				'',
			description: itemOrCollectionOrAssignmentOrPage?.description || '',
			issued: (itemOrCollectionOrAssignmentOrPage as Avo.Item.Item)?.issued || '',
			organisation:
				(itemOrCollectionOrAssignmentOrPage as Avo.Item.Item | Avo.Collection.Collection)
					?.organisation || '',
			thumbnail: {
				label: itemLabel,
				meta: getThumbnailMetadata(itemOrCollectionOrAssignmentOrPage),
				src:
					element.copyrightImage ||
					getThumbnailFromItem(itemOrCollectionOrAssignmentOrPage),
				topRight: showCopyrightNotice && (
					<Button
						type="inline-link"
						onClick={(evt) =>
							handleCopyrightClicked(
								evt,
								itemOrCollectionOrAssignmentOrPage.copyright_organisation as Avo.Organization.Organization
							)
						}
						label={tText(
							'admin/content-page/components/blocks/media-grid-wrapper/media-grid-wrapper___bron'
						)}
						title={tText(
							'admin/content-page/components/blocks/media-grid-wrapper/media-grid-wrapper___bekijk-de-copyright-info-van-deze-afbeelding'
						)}
					/>
				),
			},
			src: itemOrCollectionOrAssignmentOrPage?.src,
			item_collaterals:
				(itemOrCollectionOrAssignmentOrPage as Avo.Item.Item)?.item_collaterals || null,
		} as any;
	};

	const openInModal = (mediaListItem: MediaListItem): boolean => {
		return (
			openMediaInModal &&
			(mediaListItem?.itemAction?.type === 'ITEM' ||
				mediaListItem?.itemAction?.type === 'ITEM_WITH_CUE_POINTS')
		);
	};

	const renderMediaCardWrapper = (mediaCard: ReactNode, item: MediaListItem) => {
		if (openInModal(item)) {
			return (
				<a
					onClick={() =>
						setActiveItem(
							(resolvedResults?.find((resultItem) => resultItem.src === item.src) ||
								null) as
								| (Avo.Item.Item &
										ResolvedItemOrCollectionOrAssignmentOrContentPage)
								| null
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
			ariaLabel: tText(
				'search/components/media-grid-wrapper/media-grid-wrapper___toggle-bladwijzer'
			),
			title: tText(
				'search/components/media-grid-wrapper/media-grid-wrapper___toggle-bladwijzer'
			),
			onClick: toggleBookmark,
		});
	};

	// Render
	const renderMediaGridBlock = () => {
		const elements = compact(resolvedResults || []).map(
			mapItemOrCollectionOrAssignmentOrBundleOrPageData
		);

		const activeItemCuePoints = {
			start: activeItem?.start_cue_point || null,
			end: activeItem?.end_cue_point || null,
		};

		return (
			<>
				<BlockMediaGrid
					title={title}
					titleType={titleType}
					buttonLabel={buttonLabel}
					buttonAltTitle={buttonAltTitle}
					buttonAction={buttonAction || searchQuery}
					ctaTitle={ctaTitle}
					ctaTitleColor={ctaTitleColor}
					ctaTitleBackgroundColor={ctaTitleBackgroundColor}
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
				{/* Modal for playing video on klaar pages without having to login */}
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
								cuePointsVideo={activeItemCuePoints}
								cuePointsLabel={activeItemCuePoints}
								verticalLayout
								showTitle
								showMetadata={false}
								enableMetadataLink={false}
								titleLink={
									commonUser
										? buildLink(APP_PATH.ITEM_DETAIL.route, {
												id: activeItem.external_id,
										  })
										: undefined
								}
								collapseDescription={false}
								renderButtons={renderBookmarkButton}
								trackPlayEvent={true}
							/>
						)}
					</ModalBody>
				</Modal>
				{/* Modal for displaying copyright info about the tile's image https://meemoo.atlassian.net/browse/AVO-3015 */}
				<Modal
					isOpen={!!activeCopyright}
					onClose={() => {
						setActiveCopyright(null);
					}}
					size="small"
					title={tText(
						'admin/content-page/components/blocks/media-grid-wrapper/media-grid-wrapper___copyright-info'
					)}
				>
					<ModalBody>
						{tHtml(
							'admin/content-page/components/blocks/media-grid-wrapper/media-grid-wrapper___deze-afbeelding-valt-onder-copyright-van-organisation-name',
							{
								organisationName: activeCopyright?.name || '',
								organisationWebsite: activeCopyright?.website || '',
							}
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
