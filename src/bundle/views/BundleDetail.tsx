import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import {
	Button,
	ButtonToolbar,
	Column,
	Container,
	Flex,
	Grid,
	HeaderContentType,
	Icon,
	IconName,
	MediaCard,
	MediaCardMetaData,
	MediaCardThumbnail,
	MetaData,
	MetaDataItem,
	MoreOptionsDropdown,
	Spacer,
	Spinner,
	Thumbnail,
	ToggleButton,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import classnames from 'classnames';
import { compact, get, noop } from 'lodash-es';
import React, { type FC, useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router';
import { Link, type RouteComponentProps } from 'react-router-dom';
import { compose } from 'redux';

import { PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import RegisterOrLogin from '../../authentication/views/RegisterOrLogin';
import { renderRelatedItems } from '../../collection/collection.helpers';
import { CollectionService } from '../../collection/collection.service';
import {
	blockTypeToContentType,
	CollectionCreateUpdateTab,
	CollectionOrBundle,
	ContentTypeNumber,
} from '../../collection/collection.types';
import { PublishCollectionModal } from '../../collection/components';
import { useGetCollectionOrBundleByIdOrInviteToken } from '../../collection/hooks/useGetCollectionOrBundleByIdOrInviteToken';
import { COLLECTION_COPY, COLLECTION_COPY_REGEX } from '../../collection/views/CollectionDetail';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import { ALL_SEARCH_FILTERS, type SearchFilter } from '../../search/search.const';
import {
	CommonMetaData,
	DeleteObjectModal,
	InteractiveTour,
	ShareThroughEmailModal,
} from '../../shared/components';
import Html from '../../shared/components/Html/Html';
import JsonLd from '../../shared/components/JsonLd/JsonLd';
import { getMoreOptionsLabel } from '../../shared/constants';
import {
	buildLink,
	createDropdownMenuItem,
	CustomError,
	formatDate,
	getFullName,
	isMobileWidth,
	renderAvatar,
} from '../../shared/helpers';
import {
	defaultGoToDetailLink,
	defaultRenderDetailLink,
} from '../../shared/helpers/default-render-detail-link';
import { defaultRenderSearchLink } from '../../shared/helpers/default-render-search-link';
import { renderMobileDesktop } from '../../shared/helpers/renderMobileDesktop';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import {
	BookmarksViewsPlaysService,
	DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS,
} from '../../shared/services/bookmarks-views-plays-service';
import { type BookmarkViewPlayCounts } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { trackEvents } from '../../shared/services/event-logging-service';
import {
	getRelatedItems,
	ObjectTypes,
	ObjectTypesAll,
} from '../../shared/services/related-items-service';
import { ToastService } from '../../shared/services/toast-service';
import { BundleAction } from '../bundle.types';

import './BundleDetail.scss';
import { type CollectionFragment } from '@viaa/avo2-types/types/collection';

type BundleDetailProps = {
	id?: string;
	enabledMetaData: SearchFilter[];
};

const BundleDetail: FC<BundleDetailProps & UserProps & RouteComponentProps<{ id: string }>> = ({
	history,
	match,
	commonUser,
	id,
	enabledMetaData = ALL_SEARCH_FILTERS,
}) => {
	const { tText, tHtml } = useTranslation();

	// State
	const [bundleId, setBundleId] = useState(id || match.params.id);
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
	const [isShareThroughEmailModalOpen, setIsShareThroughEmailModalOpen] = useState(false);
	const [isFirstRender, setIsFirstRender] = useState<boolean>(false);
	const [relatedItems, setRelatedBundles] = useState<Avo.Search.ResultItem[] | null>(null);
	const [permissions, setPermissions] = useState<
		Partial<{
			canViewBundle: boolean;
			canViewPublishedBundles: boolean;
			canViewUnpublishedBundles: boolean;
			canEditBundle: boolean;
			canPublishBundle: boolean;
			canDeleteBundle: boolean;
			canCreateBundles: boolean;
			canViewItems: boolean;
		}>
	>({});
	const [viewCountsById, setViewCountsById] = useState<{ [id: string]: number }>({});
	const [bookmarkViewPlayCounts, setBookmarkViewPlayCounts] = useState<BookmarkViewPlayCounts>(
		DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS
	);
	const [showLoginPopup, setShowLoginPopup] = useState<boolean | null>(null);
	const {
		data: bundleObj,
		isError: isErrorBundle,
		isLoading: isLoadingBundle,
		refetch: refetchBundle,
	} = useGetCollectionOrBundleByIdOrInviteToken(bundleId, CollectionOrBundle.BUNDLE, undefined);

	// Computed
	const isOwner =
		!!bundleObj?.owner_profile_id && bundleObj?.owner_profile_id === commonUser?.profileId;

	// Get view counts for each fragment
	const getViewCounts = useCallback(async () => {
		if (!bundleObj) {
			return;
		}
		try {
			setViewCountsById(
				await BookmarksViewsPlaysService.getMultipleViewCounts(
					bundleObj.collection_fragments.map((fragment) => fragment.external_id),
					'collection'
				)
			);
		} catch (err) {
			console.error(new CustomError('Failed to get counts for bundle fragments', err, {}));
		}
	}, [bundleObj]);

	const checkPermissions = useCallback(async () => {
		if (!bundleObj) {
			return;
		}
		let showPopup = false;
		const permissionObj = await PermissionService.checkPermissions(
			{
				canViewBundle: [{ name: PermissionName.VIEW_OWN_BUNDLES, obj: bundleId }],
				canViewPublishedBundles: [
					{
						name: PermissionName.VIEW_ANY_PUBLISHED_BUNDLES,
					},
				],
				canViewUnpublishedBundles: [
					{
						name: PermissionName.VIEW_ANY_UNPUBLISHED_BUNDLES,
					},
				],
				canEditBundle: [
					{ name: PermissionName.EDIT_OWN_BUNDLES, obj: bundleId },
					{ name: PermissionName.EDIT_ANY_BUNDLES },
				],
				canPublishBundle: [
					{ name: PermissionName.PUBLISH_OWN_BUNDLES, obj: bundleId },
					{ name: PermissionName.PUBLISH_ANY_BUNDLES },
				],
				canDeleteBundle: [
					{ name: PermissionName.DELETE_OWN_BUNDLES, obj: bundleId },
					{ name: PermissionName.DELETE_ANY_BUNDLES },
				],
				canCreateBundles: [{ name: PermissionName.CREATE_BUNDLES }],
				canViewItems: [{ name: PermissionName.VIEW_ANY_PUBLISHED_ITEMS }],
			},
			commonUser
		);

		if (!commonUser) {
			showPopup = true;
		} else {
			if (
				!permissionObj.canViewBundle &&
				!permissionObj.canViewPublishedBundles &&
				!permissionObj.canViewUnpublishedBundles
			) {
				showPopup = true;
			}
		}

		if (!commonUser) {
			setShowLoginPopup(showPopup);
			return;
		}

		if (
			permissionObj &&
			((!permissionObj.canViewBundle &&
				bundleObj.is_public &&
				!permissionObj.canViewPublishedBundles) ||
				(!permissionObj.canViewBundle &&
					!bundleObj.is_public &&
					!permissionObj.canViewUnpublishedBundles))
		) {
			showPopup = true;
		}

		// Do not trigger events when a search engine loads this page
		if (!showPopup) {
			BookmarksViewsPlaysService.action('view', 'bundle', bundleId, commonUser).then(noop);
			trackEvents(
				{
					object: bundleId,
					object_type: 'bundle',
					action: 'view',
				},
				commonUser
			);

			try {
				commonUser &&
					setBookmarkViewPlayCounts(
						await BookmarksViewsPlaysService.getCollectionCounts(bundleId, commonUser)
					);
			} catch (err) {
				console.error(
					new CustomError('Failed to get getCollectionCounts for bundle', err, {
						uuid: bundleId,
					})
				);
				ToastService.danger(
					tHtml(
						'bundle/views/bundle-detail___het-ophalen-van-het-aantal-keer-bekeken-gebookmarked-is-mislukt'
					)
				);
			}

			getRelatedItems(bundleId, ObjectTypes.bundles, ObjectTypesAll.all, 4)
				.then((relatedItems) => {
					setRelatedBundles(relatedItems);
				})
				.catch((err) => {
					console.error('Failed to get related items', err, {
						bundleId,
						type: 'bundles',
						limit: 4,
					});
					ToastService.danger(
						tHtml(
							'bundle/views/bundle-detail___het-ophalen-van-de-gerelateerde-bundels-is-mislukt'
						)
					);
				});
		}

		setShowLoginPopup(showPopup);
		setPermissions(permissionObj || {});
	}, [bundleId, bundleObj, commonUser, tHtml]);

	useEffect(() => {
		if (bundleObj) {
			checkPermissions();
		}
	}, [bundleObj, checkPermissions]);

	useEffect(() => {
		if (bundleObj) {
			getViewCounts();
		}
	}, [bundleObj, getViewCounts]);

	// Listeners
	const onEditBundle = () => {
		redirectToClientPage(
			buildLink(APP_PATH.BUNDLE_EDIT_TAB.route, {
				id: bundleId,
				tabId: CollectionCreateUpdateTab.CONTENT,
			}),
			history
		);
	};

	const onDeleteBundle = async () => {
		try {
			setIsDeleteModalOpen(false);
			await CollectionService.deleteCollectionOrBundle(bundleId);

			trackEvents(
				{
					object: bundleId,
					object_type: 'collection',
					action: 'delete',
				},
				commonUser
			);

			history.push(APP_PATH.WORKSPACE.route);
			ToastService.success(
				tHtml('bundle/views/bundle-detail___de-bundel-werd-succesvol-verwijderd')
			);
		} catch (err) {
			console.error(err);
			ToastService.danger(
				tHtml('bundle/views/bundle-detail___het-verwijderen-van-de-bundel-is-mislukt')
			);
		}
	};

	const onDuplicateBundle = async () => {
		try {
			if (!bundleObj) {
				ToastService.danger(
					tHtml(
						'bundle/views/bundle-detail___de-bundel-kan-niet-gekopieerd-worden-omdat-deze-nog-niet-is-opgehaald-van-de-database'
					)
				);
				return;
			}
			if (!commonUser) {
				ToastService.danger(
					tHtml(
						'bundle/views/bundle-detail___er-was-een-probleem-met-het-controleren-van-de-ingelogde-gebruiker-log-opnieuw-in-en-probeer-opnieuw'
					)
				);
				return;
			}
			const duplicateBundle = await CollectionService.duplicateCollection(
				bundleObj,
				commonUser,
				COLLECTION_COPY,
				COLLECTION_COPY_REGEX
			);

			trackEvents(
				{
					object: String(bundleObj.id),
					object_type: 'bundle',
					action: 'copy',
				},
				commonUser
			);

			defaultGoToDetailLink(history)(duplicateBundle.id, 'bundel');
			setBundleId(duplicateBundle.id);
			ToastService.success(
				tHtml(
					'bundle/views/bundle-detail___de-bundel-is-gekopieerd-u-kijkt-nu-naar-de-kopie'
				)
			);
		} catch (err) {
			console.error('Failed to copy bundle', err, { originalBundle: bundleObj });
			ToastService.danger(
				tHtml('bundle/views/bundle-detail___het-kopieren-van-de-bundel-is-mislukt')
			);
		}
	};

	const executeAction = async (action: BundleAction) => {
		setIsOptionsMenuOpen(false);

		switch (action) {
			case BundleAction.delete:
				setIsDeleteModalOpen(true);
				break;

			case BundleAction.duplicate:
				await onDuplicateBundle();
				break;

			case BundleAction.publish:
				setIsPublishModalOpen(true);
				break;

			case BundleAction.edit:
				onEditBundle();
				break;

			case BundleAction.toggleBookmark:
				await toggleBookmark();
				break;

			case BundleAction.share:
				setIsShareThroughEmailModalOpen(true);
				break;

			default:
				return null;
		}
	};

	const toggleBookmark = async () => {
		if (!commonUser) {
			ToastService.danger(
				tHtml(
					'bundle/views/bundle-detail___er-was-een-probleem-met-het-controleren-van-de-ingelogde-gebruiker-log-opnieuw-in-en-probeer-opnieuw'
				)
			);
			return;
		}
		try {
			await BookmarksViewsPlaysService.toggleBookmark(
				bundleId,
				commonUser,
				'collection',
				bookmarkViewPlayCounts.isBookmarked
			);
			setBookmarkViewPlayCounts({
				...bookmarkViewPlayCounts,
				isBookmarked: !bookmarkViewPlayCounts.isBookmarked,
			});
			ToastService.success(
				bookmarkViewPlayCounts.isBookmarked
					? tHtml('bundle/views/bundle-detail___de-beladwijzer-is-verwijderd')
					: tHtml('bundle/views/bundle-detail___de-bladwijzer-is-aangemaakt')
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to toggle bookmark', err, {
					bundleId,
					commonUser,
					type: 'bundle',
					isBookmarked: bookmarkViewPlayCounts.isBookmarked,
				})
			);
			ToastService.danger(
				bookmarkViewPlayCounts.isBookmarked
					? tHtml(
							'bundle/views/bundle-detail___het-verwijderen-van-de-bladwijzer-is-mislukt'
					  )
					: tHtml(
							'bundle/views/bundle-detail___het-aanmaken-van-de-bladwijzer-is-mislukt'
					  )
			);
		}
	};

	// Render functions
	const renderChildFragments = (bundleFragments: CollectionFragment[]) => {
		if (!bundleObj) {
			return null;
		}
		return bundleFragments.map((fragment: Avo.Collection.Fragment) => {
			const collectionOrAssignment = fragment.item_meta as
				| Avo.Collection.Collection
				| (Avo.Assignment.Assignment & { type_id: number });
			if (!collectionOrAssignment) {
				return null;
			}
			const category =
				collectionOrAssignment.type_id === ContentTypeNumber.collection
					? 'collection'
					: 'assignment';
			return (
				<Column size="3-4" key={`bundle-fragment-${fragment.id}`}>
					<Link
						to={buildLink(APP_PATH.COLLECTION_DETAIL.route, {
							id: collectionOrAssignment.id,
						})}
						className="a-link__no-styles"
					>
						<MediaCard
							className="u-clickable"
							category={blockTypeToContentType(fragment.type)}
							orientation="vertical"
							title={
								(fragment.use_custom_fields
									? fragment.custom_title
									: collectionOrAssignment.title) || ''
							}
						>
							<MediaCardThumbnail>
								<Thumbnail
									category={category}
									src={collectionOrAssignment.thumbnail_path || undefined}
									meta={`${collectionOrAssignment?.item_count || 0} items`}
									label={
										collectionOrAssignment.type_id ===
										ContentTypeNumber.collection
											? tText('admin/shared/constants/index___collectie')
											: tText('admin/shared/constants/index___opdracht')
									}
								/>
							</MediaCardThumbnail>
							<MediaCardMetaData>
								<MetaData category={category}>
									<MetaDataItem
										label={String(viewCountsById[fragment.external_id] || 0)}
										icon={IconName.eye}
									/>
									<MetaDataItem
										label={formatDate(collectionOrAssignment.updated_at)}
									/>
								</MetaData>
							</MediaCardMetaData>
						</MediaCard>
					</Link>
				</Column>
			);
		});
	};

	const renderActionDropdown = () => {
		const BUNDLE_DROPDOWN_ITEMS = [
			...createDropdownMenuItem(
				BundleAction.duplicate,
				tText('bundle/views/bundle-detail___dupliceer'),
				'copy',
				permissions.canCreateBundles || false
			),
			...createDropdownMenuItem(
				BundleAction.delete,
				tText('bundle/views/bundle-detail___verwijder'),
				undefined,
				permissions.canDeleteBundle || false
			),
		];

		return (
			<MoreOptionsDropdown
				isOpen={isOptionsMenuOpen}
				onOpen={() => setIsOptionsMenuOpen(true)}
				onClose={() => setIsOptionsMenuOpen(false)}
				menuItems={BUNDLE_DROPDOWN_ITEMS}
				onOptionClicked={(action) => executeAction(action as BundleAction)}
				label={getMoreOptionsLabel()}
			/>
		);
	};

	const renderActions = () => {
		if (isMobileWidth()) {
			const BUNDLE_DROPDOWN_ITEMS = [
				...createDropdownMenuItem(
					BundleAction.edit,
					tText('bundle/views/bundle-detail___bewerken'),
					'edit',
					permissions.canEditBundle || false
				),
				...createDropdownMenuItem(
					BundleAction.publish,
					tText('bundle/views/bundle-detail___delen'),
					'lock',
					permissions.canPublishBundle || false
				),
				...createDropdownMenuItem(
					BundleAction.toggleBookmark,
					bookmarkViewPlayCounts.isBookmarked
						? tText('bundle/views/bundle-detail___verwijder-bladwijzer')
						: tText('bundle/views/bundle-detail___maak-bladwijzer'),
					bookmarkViewPlayCounts.isBookmarked ? 'bookmark-filled' : 'bookmark',
					!isOwner
				),
				...createDropdownMenuItem(
					BundleAction.share,
					tText('bundle/views/bundle-detail___share-bundel'),
					'share-2',
					!!bundleObj && bundleObj.is_public
				),
				...createDropdownMenuItem(
					BundleAction.duplicate,
					tText('bundle/views/bundle-detail___dupliceer'),
					'copy',
					permissions.canCreateBundles || false
				),
				...createDropdownMenuItem(
					BundleAction.delete,
					tText('bundle/views/bundle-detail___verwijder'),
					undefined,
					permissions.canDeleteBundle || false
				),
			];
			return (
				<MoreOptionsDropdown
					isOpen={isOptionsMenuOpen}
					onOpen={() => setIsOptionsMenuOpen(true)}
					onClose={() => setIsOptionsMenuOpen(false)}
					label={getMoreOptionsLabel()}
					menuItems={BUNDLE_DROPDOWN_ITEMS}
					onOptionClicked={(action) => executeAction(action as BundleAction)}
				/>
			);
		}
		const isPublic = bundleObj && bundleObj.is_public;
		return (
			<ButtonToolbar>
				{permissions.canPublishBundle && (
					<Button
						title={
							isPublic
								? tText('bundle/views/bundle-detail___maak-deze-bundel-prive')
								: tText('bundle/views/bundle-detail___maak-deze-bundel-openbaar')
						}
						ariaLabel={
							isPublic
								? tText('bundle/views/bundle-detail___maak-deze-bundel-prive')
								: tText('bundle/views/bundle-detail___maak-deze-bundel-openbaar')
						}
						icon={isPublic ? IconName.unlock3 : IconName.lock}
						onClick={() => executeAction(BundleAction.publish)}
						type="secondary"
					/>
				)}
				{permissions.canEditBundle && (
					<Button
						label={tText('bundle/views/bundle-detail___bewerken')}
						title={tText('bundle/views/bundle-detail___pas-de-bundel-aan')}
						onClick={() => executeAction(BundleAction.edit)}
						type="primary"
					/>
				)}
				<ToggleButton
					title={tText('collection/views/collection-detail___bladwijzer')}
					type="secondary"
					icon={IconName.bookmark}
					active={bookmarkViewPlayCounts.isBookmarked}
					ariaLabel={tText('collection/views/collection-detail___bladwijzer')}
					onClick={() => executeAction(BundleAction.toggleBookmark)}
				/>
				{isPublic && (
					<Button
						title={tText('bundle/views/bundle-detail___share-bundel')}
						type="secondary"
						icon={IconName.share2}
						ariaLabel={tText('bundle/views/bundle-detail___share-bundel')}
						onClick={() => executeAction(BundleAction.share)}
					/>
				)}
				{renderActionDropdown()}
				{!!commonUser && <InteractiveTour showButton />}
			</ButtonToolbar>
		);
	};

	const renderMetaDataAndRelated = () => {
		if (!bundleObj) {
			return null;
		}
		return (
			<Container mode="vertical">
				<Container mode="horizontal">
					<BlockHeading type="h3">
						{tText('bundle/views/bundle-detail___over-deze-bundel')}
					</BlockHeading>
					<Grid>
						<CommonMetaData
							subject={bundleObj}
							enabledMetaData={enabledMetaData}
							renderSearchLink={defaultRenderSearchLink}
						/>
					</Grid>
					{(relatedItems?.length || 0) > 0 && (
						<>
							<hr className="c-hr" />
							{renderRelatedItems(relatedItems, defaultRenderDetailLink)}
						</>
					)}
				</Container>
			</Container>
		);
	};

	const renderBundle = () => {
		if (!bundleObj && showLoginPopup) {
			return <RegisterOrLogin />;
		}

		const { is_public, thumbnail_path, title, description_long } =
			bundleObj as Avo.Collection.Collection;

		if (!isFirstRender) {
			setIsFirstRender(true);
		}

		const collectionFragments = (bundleObj?.collection_fragments || []).filter(
			(f) => f.type === 'COLLECTION'
		);
		const assignmentFragments = (bundleObj?.collection_fragments || []).filter(
			(f) => f.type === 'ASSIGNMENT'
		);
		return (
			<>
				<Helmet>
					<title>
						{GENERATE_SITE_TITLE(
							get(
								bundleObj,
								'title',
								tText('bundle/views/bundle-detail___bundel-detail-titel-fallback')
							)
						)}
					</title>
					<meta name="description" content={get(bundleObj, 'description') || ''} />
				</Helmet>
				<JsonLd
					url={window.location.href}
					title={bundleObj?.title}
					description={bundleObj?.description}
					image={bundleObj?.thumbnail_path}
					isOrganisation={!!bundleObj?.profile?.organisation}
					author={getFullName(bundleObj?.profile, true, false)}
					publishedAt={bundleObj?.published_at}
					updatedAt={bundleObj?.updated_at}
					keywords={compact(bundleObj?.loms?.map((lom) => lom.lom?.label))}
				/>
				<div
					className={classnames(
						'm-bundle-detail',
						showLoginPopup ? 'hide-behind-login-popup' : ''
					)}
				>
					<Container mode="vertical" background="alt" className="m-bundle-detail-header">
						<Container mode="horizontal">
							<Grid>
								<Column size="3-2">
									{renderMobileDesktop({
										mobile: (
											<Thumbnail
												className="u-spacer"
												category="bundle"
												src={thumbnail_path || undefined}
											/>
										),
										desktop: (
											<Thumbnail
												className="u-spacer-right-l"
												category="bundle"
												src={thumbnail_path || undefined}
											/>
										),
									})}
								</Column>
								<Column size="3-10">
									<Toolbar
										autoHeight
										className={
											isMobileWidth() ? 'c-bundle-toolbar__mobile' : ''
										}
									>
										<ToolbarLeft>
											<ToolbarItem>
												<MetaData spaced={true} category="bundle">
													<MetaDataItem>
														<HeaderContentType
															category="bundle"
															label={
																is_public
																	? tText(
																			'bundle/views/bundle-detail___openbare-bundel'
																	  )
																	: tText(
																			'bundle/views/bundle-detail___prive-bundel'
																	  )
															}
														/>
													</MetaDataItem>
													<MetaDataItem
														icon={IconName.eye}
														label={String(
															bookmarkViewPlayCounts.viewCount || 0
														)}
													/>
													<MetaDataItem
														icon={IconName.bookmark}
														label={String(
															bookmarkViewPlayCounts.bookmarkCount ||
																0
														)}
													/>
												</MetaData>
												<Spacer margin="top-small">
													<BlockHeading type="h1">{title}</BlockHeading>
												</Spacer>
											</ToolbarItem>
										</ToolbarLeft>
										{!showLoginPopup && (
											<ToolbarRight>
												<ToolbarItem>{renderActions()}</ToolbarItem>
											</ToolbarRight>
										)}
									</Toolbar>
									<Html
										className="c-body-1 c-content"
										content={description_long || ''}
									/>
									<div className="c-avatar-and-text u-spacer-bottom-l u-spacer-top-l">
										{!!bundleObj &&
											!!bundleObj.profile &&
											renderAvatar(bundleObj.profile, { dark: true })}
									</div>
								</Column>
							</Grid>
						</Container>
						<Container mode="vertical" background="white">
							<Container mode="horizontal">
								{collectionFragments.length > 0 && (
									<>
										{assignmentFragments.length > 0 && (
											<BlockHeading type="h3" className="u-spacer-bottom-l">
												<Icon
													name={IconName.collection}
													className="u-spacer-right-s u-spacer-bottom-xs u-color-ocean-green"
												/>
												{tText('Collecties in deze bundel')}
											</BlockHeading>
										)}
										<div className="c-media-card-list u-spacer-bottom-l">
											<Grid>{renderChildFragments(collectionFragments)}</Grid>
										</div>
									</>
								)}
								{assignmentFragments.length > 0 && (
									<>
										{collectionFragments.length > 0 && (
											<BlockHeading type="h3" className="u-spacer-bottom-l">
												<Icon
													name={IconName.clipboard}
													className="u-spacer-right-s u-spacer-bottom-xs u-color-french-rose"
												/>
												{tText('Opdrachten in deze bundel')}
											</BlockHeading>
										)}
										<div className="c-media-card-list">
											<Grid>{renderChildFragments(assignmentFragments)}</Grid>
										</div>
									</>
								)}
							</Container>
						</Container>
						{renderMetaDataAndRelated()}
						{!!bundleObj && !!commonUser && (
							<PublishCollectionModal
								collection={bundleObj}
								isOpen={isPublishModalOpen}
								onClose={(newBundle: Avo.Collection.Collection | undefined) => {
									setIsPublishModalOpen(false);
									if (newBundle) {
										refetchBundle();
									}
								}}
							/>
						)}
					</Container>
				</div>
				{!showLoginPopup && (
					<>
						<DeleteObjectModal
							title={tText(
								'bundle/views/bundle-detail___ben-je-zeker-dat-je-deze-bundel-wil-verwijderen'
							)}
							body={tText(
								'bundle/views/bundle-detail___deze-actie-kan-niet-ongedaan-gemaakt-worden'
							)}
							isOpen={isDeleteModalOpen}
							onClose={() => setIsDeleteModalOpen(false)}
							confirmCallback={onDeleteBundle}
						/>
						<ShareThroughEmailModal
							modalTitle={tText('bundle/views/bundle-detail___deel-deze-bundel')}
							type="bundle"
							emailLinkHref={window.location.href}
							emailLinkTitle={(bundleObj as Avo.Collection.Collection).title}
							isOpen={isShareThroughEmailModalOpen}
							onClose={() => setIsShareThroughEmailModalOpen(false)}
						/>
					</>
				)}
				{showLoginPopup && <RegisterOrLogin />}
			</>
		);
	};

	const renderPageContent = () => {
		if (isLoadingBundle) {
			return (
				<Flex center>
					<Spinner size="large" />
				</Flex>
			);
		}
		if (isErrorBundle) {
			return (
				<ErrorView
					icon={IconName.alertTriangle}
					message={tHtml(
						'bundle/views/bundle-detail___het-laden-van-de-bundel-is-mislukt'
					)}
					actionButtons={['home']}
				/>
			);
		}
		return renderBundle();
	};

	return renderPageContent();
};

export default compose(withRouter, withUser)(BundleDetail) as FC<BundleDetailProps>;
