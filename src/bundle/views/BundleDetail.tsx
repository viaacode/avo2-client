import { BlockHeading } from '@meemoo/admin-core-ui';
import {
	Button,
	ButtonToolbar,
	Column,
	Container,
	Flex,
	FlexItem,
	Grid,
	HeaderContentType,
	IconName,
	MediaCard,
	MediaCardMetaData,
	MediaCardThumbnail,
	MetaData,
	MetaDataItem,
	MoreOptionsDropdown,
	Spacer,
	Thumbnail,
	ToggleButton,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { PermissionName } from '@viaa/avo2-types';
import classnames from 'classnames';
import { get, isNil } from 'lodash-es';
import React, { FunctionComponent, ReactText, useEffect, useState } from 'react';
import MetaTags from 'react-meta-tags';
import { withRouter } from 'react-router';
import { Link, RouteComponentProps } from 'react-router-dom';
import { compose } from 'redux';

import { PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import RegisterOrLogin from '../../authentication/views/RegisterOrLogin';
import { renderRelatedItems } from '../../collection/collection.helpers';
import { CollectionService } from '../../collection/collection.service';
import { blockTypeToContentType } from '../../collection/collection.types';
import { PublishCollectionModal } from '../../collection/components';
import { COLLECTION_COPY, COLLECTION_COPY_REGEX } from '../../collection/views/CollectionDetail';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import { ALL_SEARCH_FILTERS, SearchFilter } from '../../search/search.const';
import {
	CommonMetaData,
	DeleteObjectModal,
	InteractiveTour,
	LoadingErrorLoadedComponent,
	LoadingInfo,
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
import withUser, { UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import {
	BookmarksViewsPlaysService,
	DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS,
} from '../../shared/services/bookmarks-views-plays-service';
import { BookmarkViewPlayCounts } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { trackEvents } from '../../shared/services/event-logging-service';
import {
	getRelatedItems,
	ObjectTypes,
	ObjectTypesAll,
} from '../../shared/services/related-items-service';
import { ToastService } from '../../shared/services/toast-service';

import './BundleDetail.scss';

type BundleDetailProps = {
	id?: string;
	enabledMetaData: SearchFilter[];
};

const BundleDetail: FunctionComponent<
	BundleDetailProps & UserProps & RouteComponentProps<{ id: string }>
> = ({ history, match, user, id, enabledMetaData = ALL_SEARCH_FILTERS }) => {
	const { tText, tHtml } = useTranslation();

	// State
	const [bundleId, setBundleId] = useState(id || match.params.id);
	const [bundle, setBundle] = useState<Avo.Collection.Collection | null>(null);
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
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [viewCountsById, setViewCountsById] = useState<{ [id: string]: number }>({});
	const [bookmarkViewPlayCounts, setBookmarkViewPlayCounts] = useState<BookmarkViewPlayCounts>(
		DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS
	);
	const [showLoginPopup, setShowLoginPopup] = useState<boolean | null>(null);
	const isOwner = !!bundle?.owner_profile_id && bundle?.owner_profile_id === user?.profile?.id;

	useEffect(() => {
		const checkPermissionsAndGetBundle = async () => {
			let showPopup = false;
			let permissionObj = undefined;

			if (!user) {
				showPopup = true;
			} else {
				permissionObj = await PermissionService.checkPermissions(
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
					user
				);

				if (
					!permissionObj.canViewBundle &&
					!permissionObj.canViewPublishedBundles &&
					!permissionObj.canViewUnpublishedBundles
				) {
					showPopup = true;
				}
			}

			if (!user) {
				setLoadingInfo({
					state: 'loaded',
				});
				setShowLoginPopup(showPopup);
				return;
			}

			const bundleObj = await CollectionService.fetchCollectionOrBundleByIdOrInviteToken(
				bundleId,
				'bundle',
				undefined
			);

			if (!bundleObj) {
				setLoadingInfo({
					state: 'error',
					message: tHtml(
						'bundle/views/bundle-detail___de-bundel-kon-niet-worden-gevonden'
					),
					icon: IconName.search,
				});
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
				trackEvents(
					{
						object: bundleId,
						object_type: 'bundle',
						action: 'view',
					},
					user
				);

				BookmarksViewsPlaysService.action('view', 'bundle', bundleObj.id, user);

				// Get view counts for each fragment
				try {
					setViewCountsById(
						await BookmarksViewsPlaysService.getMultipleViewCounts(
							bundleObj.collection_fragments.map((fragment) => fragment.external_id),
							'collection'
						)
					);
				} catch (err) {
					console.error(
						new CustomError('Failed to get counts for bundle fragments', err, {})
					);
				}

				try {
					user &&
						setBookmarkViewPlayCounts(
							await BookmarksViewsPlaysService.getCollectionCounts(bundleId, user)
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
			setBundle(bundleObj || null);
		};

		checkPermissionsAndGetBundle().catch((err) => {
			if ((err as CustomError)?.innerException?.statusCode === 404 && !user) {
				// If not logged in and the bundle is not found => the bundle might be private and the user might need to login to see it
				setShowLoginPopup(true);
				setLoadingInfo({
					state: 'loaded',
				});
				return;
			}
			console.error(
				new CustomError(
					'Failed to check permissions or get bundle from the database',
					err,
					{
						bundleId,
					}
				)
			);
			setLoadingInfo({
				state: 'error',
				message: tHtml(
					'bundle/views/bundle-detail___er-ging-iets-mis-tijdens-het-ophalen-van-de-bundel'
				),
				icon: IconName.alertTriangle,
			});
		});
	}, [user, bundleId, setLoadingInfo, setShowLoginPopup, tText]);

	useEffect(() => {
		if (bundle && !isNil(showLoginPopup)) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [permissions, bundle, setLoadingInfo, showLoginPopup]);

	// Listeners
	const onEditBundle = () => {
		redirectToClientPage(buildLink(APP_PATH.BUNDLE_EDIT.route, { id: bundleId }), history);
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
				user
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
			if (!bundle) {
				ToastService.danger(
					tHtml(
						'bundle/views/bundle-detail___de-bundel-kan-niet-gekopieerd-worden-omdat-deze-nog-niet-is-opgehaald-van-de-database'
					)
				);
				return;
			}
			if (!user) {
				ToastService.danger(
					tHtml(
						'bundle/views/bundle-detail___er-was-een-probleem-met-het-controleren-van-de-ingelogde-gebruiker-log-opnieuw-in-en-probeer-opnieuw'
					)
				);
				return;
			}
			const duplicateBundle = await CollectionService.duplicateCollection(
				bundle,
				user,
				COLLECTION_COPY,
				COLLECTION_COPY_REGEX
			);

			trackEvents(
				{
					object: String(bundle.id),
					object_type: 'bundle',
					action: 'copy',
				},
				user
			);

			defaultGoToDetailLink(history)(duplicateBundle.id, 'bundel');
			setBundleId(duplicateBundle.id);
			ToastService.success(
				tHtml(
					'bundle/views/bundle-detail___de-bundel-is-gekopieerd-u-kijkt-nu-naar-de-kopie'
				)
			);
		} catch (err) {
			console.error('Failed to copy bundle', err, { originalBundle: bundle });
			ToastService.danger(
				tHtml('bundle/views/bundle-detail___het-kopieren-van-de-bundel-is-mislukt')
			);
		}
	};

	const executeAction = async (item: ReactText) => {
		setIsOptionsMenuOpen(false);

		switch (item) {
			case 'delete':
				setIsDeleteModalOpen(true);
				break;

			case 'duplicate':
				await onDuplicateBundle();
				break;

			case 'openPublishModal':
				setIsPublishModalOpen(true);
				break;

			case 'edit':
				onEditBundle();
				break;

			case 'toggleBookmark':
				await toggleBookmark();
				break;

			case 'openShareThroughEmailModal':
				setIsShareThroughEmailModalOpen(true);
				break;

			default:
				return null;
		}
	};

	const toggleBookmark = async () => {
		if (!user) {
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
				user,
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
					user,
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
	function renderCollectionFragments() {
		if (!bundle) {
			return null;
		}
		return (bundle.collection_fragments || []).map((fragment: Avo.Collection.Fragment) => {
			const collection = fragment.item_meta as Avo.Collection.Collection;
			if (!collection) {
				return null;
			}
			return (
				<Column size="3-4" key={`bundle-fragment-${fragment.id}`}>
					<Link
						to={buildLink(APP_PATH.COLLECTION_DETAIL.route, { id: collection.id })}
						className="a-link__no-styles"
					>
						<MediaCard
							className="u-clickable"
							category={blockTypeToContentType(fragment.type)}
							orientation="vertical"
							title={
								fragment.use_custom_fields
									? fragment.custom_title || ''
									: collection.title
							}
						>
							<MediaCardThumbnail>
								<Thumbnail
									category="collection"
									src={collection.thumbnail_path || undefined}
									meta={`${get(
										collection,
										'collection_fragments_aggregate.aggregate.count',
										0
									)} items`}
									label="collectie"
								/>
							</MediaCardThumbnail>
							<MediaCardMetaData>
								<MetaData category="collection">
									<MetaDataItem
										label={String(viewCountsById[fragment.external_id] || 0)}
										icon={IconName.eye}
									/>
									<MetaDataItem label={formatDate(collection.updated_at)} />
								</MetaData>
							</MediaCardMetaData>
						</MediaCard>
					</Link>
				</Column>
			);
		});
	}

	const renderActionDropdown = () => {
		const BUNDLE_DROPDOWN_ITEMS = [
			...createDropdownMenuItem(
				'duplicate',
				tText('bundle/views/bundle-detail___dupliceer'),
				'copy',
				permissions.canCreateBundles || false
			),
			...createDropdownMenuItem(
				'delete',
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
				onOptionClicked={executeAction}
				label={getMoreOptionsLabel()}
			/>
		);
	};

	const renderActions = () => {
		if (isMobileWidth()) {
			const BUNDLE_DROPDOWN_ITEMS = [
				...createDropdownMenuItem(
					'edit',
					tText('bundle/views/bundle-detail___bewerken'),
					'edit',
					permissions.canEditBundle || false
				),
				...createDropdownMenuItem(
					'openPublishModal',
					tText('bundle/views/bundle-detail___delen'),
					'lock',
					permissions.canPublishBundle || false
				),
				...createDropdownMenuItem(
					'toggleBookmark',
					bookmarkViewPlayCounts.isBookmarked
						? tText('bundle/views/bundle-detail___verwijder-bladwijzer')
						: tText('bundle/views/bundle-detail___maak-bladwijzer'),
					bookmarkViewPlayCounts.isBookmarked ? 'bookmark-filled' : 'bookmark',
					!isOwner
				),
				...createDropdownMenuItem(
					'openShareThroughEmailModal',
					tText('bundle/views/bundle-detail___share-bundel'),
					'share-2',
					!!bundle && bundle.is_public
				),
				...createDropdownMenuItem(
					'duplicate',
					tText('bundle/views/bundle-detail___dupliceer'),
					'copy',
					permissions.canCreateBundles || false
				),
				...createDropdownMenuItem(
					'delete',
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
					onOptionClicked={executeAction}
				/>
			);
		}
		const isPublic = bundle && bundle.is_public;
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
						onClick={() => executeAction('openPublishModal')}
						type="secondary"
					/>
				)}
				{permissions.canEditBundle && (
					<Button
						label={tText('bundle/views/bundle-detail___bewerken')}
						title={tText('bundle/views/bundle-detail___pas-de-bundel-aan')}
						onClick={() => executeAction('edit')}
						type="primary"
					/>
				)}
				<ToggleButton
					title={tText('collection/views/collection-detail___bladwijzer')}
					type="secondary"
					icon={IconName.bookmark}
					active={bookmarkViewPlayCounts.isBookmarked}
					ariaLabel={tText('collection/views/collection-detail___bladwijzer')}
					onClick={() => executeAction('toggleBookmark')}
				/>
				{isPublic && (
					<Button
						title={tText('bundle/views/bundle-detail___share-bundel')}
						type="secondary"
						icon={IconName.share2}
						ariaLabel={tText('bundle/views/bundle-detail___share-bundel')}
						onClick={() => executeAction('openShareThroughEmailModal')}
					/>
				)}
				{renderActionDropdown()}
				<InteractiveTour showButton />
			</ButtonToolbar>
		);
	};

	const renderMetaDataAndRelated = () => {
		if (!bundle) {
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
							subject={bundle}
							enabledMetaData={enabledMetaData}
							renderSearchLink={defaultRenderSearchLink}
						/>
					</Grid>
					<hr className="c-hr" />
					{renderRelatedItems(relatedItems, defaultRenderDetailLink)}
				</Container>
			</Container>
		);
	};

	const renderBundle = () => {
		if (!bundle && showLoginPopup) {
			return <RegisterOrLogin />;
		}

		const { is_public, thumbnail_path, title, description_long } =
			bundle as Avo.Collection.Collection;

		if (!isFirstRender) {
			setIsFirstRender(true);
		}

		return (
			<>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							get(
								bundle,
								'title',
								tText('bundle/views/bundle-detail___bundel-detail-titel-fallback')
							)
						)}
					</title>
					<meta name="description" content={get(bundle, 'description') || ''} />
				</MetaTags>
				<JsonLd
					url={window.location.href}
					title={get(bundle, 'title')}
					description={get(bundle, 'description')}
					image={get(bundle, 'thumbnail_path')}
					isOrganisation={!!get(bundle, 'profile.organisation')}
					author={getFullName(get(bundle, 'profile'), true, false)}
					publishedAt={get(bundle, 'published_at')}
					updatedAt={get(bundle, 'updated_at')}
					keywords={[
						...(get(bundle, 'lom_classification') || []),
						...(get(bundle, 'lom_context') || []),
					]}
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
											<Spacer>
												<Thumbnail
													category="bundle"
													src={thumbnail_path || undefined}
												/>
											</Spacer>
										),
										desktop: (
											<Spacer margin="right-large">
												<Thumbnail
													category="bundle"
													src={thumbnail_path || undefined}
												/>
											</Spacer>
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
									<Flex spaced="regular" wrap>
										<FlexItem className="c-avatar-and-text">
											{!!bundle &&
												!!bundle.profile &&
												renderAvatar(bundle.profile, { dark: true })}
										</FlexItem>
									</Flex>
								</Column>
							</Grid>
						</Container>
						<Container mode="vertical">
							<Container mode="horizontal">
								<div className="c-media-card-list">
									<Grid>{renderCollectionFragments()}</Grid>
								</div>
							</Container>
						</Container>
						{renderMetaDataAndRelated()}
						{!!bundle && !!user && (
							<PublishCollectionModal
								collection={bundle}
								isOpen={isPublishModalOpen}
								onClose={(newBundle: Avo.Collection.Collection | undefined) => {
									setIsPublishModalOpen(false);
									if (newBundle) {
										setBundle(newBundle);
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
							emailLinkTitle={(bundle as Avo.Collection.Collection).title}
							isOpen={isShareThroughEmailModalOpen}
							onClose={() => setIsShareThroughEmailModalOpen(false)}
						/>
					</>
				)}
				{showLoginPopup && <RegisterOrLogin />}
			</>
		);
	};

	if (loadingInfo.state === 'error') {
		return (
			<ErrorView
				icon={IconName.alertTriangle}
				message={tHtml('bundle/views/bundle-detail___het-laden-van-de-bundel-is-mislukt')}
				actionButtons={['home']}
			/>
		);
	}
	return (
		<>
			<LoadingErrorLoadedComponent
				render={renderBundle}
				dataObject={permissions}
				loadingInfo={loadingInfo}
				showSpinner={true}
			/>
		</>
	);
};

export default compose(withRouter, withUser)(BundleDetail) as FunctionComponent<BundleDetailProps>;
