import { useMutation } from '@apollo/react-hooks';
import { get, isEmpty } from 'lodash-es';
import React, { FunctionComponent, ReactText, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { withRouter } from 'react-router';

import {
	Avatar,
	BlockHeading,
	Button,
	ButtonToolbar,
	Column,
	Container,
	DropdownButton,
	DropdownContent,
	Flex,
	FlexItem,
	Grid,
	MediaCard,
	MediaCardMetaData,
	MediaCardThumbnail,
	MenuContent,
	MetaData,
	MetaDataItem,
	Spacer,
	TagList,
	TagOption,
	Thumbnail,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { getProfileName } from '../../authentication/helpers/get-profile-info';
import {
	PermissionNames,
	PermissionService,
} from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import {
	DELETE_COLLECTION,
	INSERT_COLLECTION,
	INSERT_COLLECTION_FRAGMENTS,
} from '../../collection/collection.gql';
import { CollectionService } from '../../collection/collection.service';
import { ShareCollectionModal } from '../../collection/components';
import { COLLECTION_COPY, COLLECTION_COPY_REGEX } from '../../collection/views/CollectionDetail';
import { APP_PATH } from '../../constants';
import {
	ControlledDropdown,
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	ShareThroughEmailModal,
} from '../../shared/components';
import { LoadingInfo } from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { buildLink, createDropdownMenuItem, CustomError, fromNow } from '../../shared/helpers';
import { BookmarksViewsPlaysService } from '../../shared/services/bookmarks-views-plays-service';
import { toastService } from '../../shared/services';
import { ApolloCacheManager } from '../../shared/services/data-service';
import { trackEvents } from '../../shared/services/event-logging-service';
import { WORKSPACE_PATH } from '../../workspace/workspace.const';

import './BundleDetail.scss';

interface BundleDetailProps extends DefaultSecureRouteProps<{ id: string }> {}

const BundleDetail: FunctionComponent<BundleDetailProps> = ({ history, location, match, user }) => {
	const [t] = useTranslation();

	// State
	const [bundleId] = useState(match.params.id);
	const [bundle, setBundle] = useState<Avo.Collection.Collection | null>(null);
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
	const [isShareThroughEmailModalOpen, setIsShareThroughEmailModalOpen] = useState(false);
	const [isFirstRender, setIsFirstRender] = useState<boolean>(false);
	const [isPublic, setIsPublic] = useState<boolean | null>(null);
	const [relatedBundles /*, setRelatedBundles */] = useState<Avo.Search.ResultItem[] | null>(
		null
	);
	const [permissions, setPermissions] = useState<
		Partial<{
			canViewBundles: boolean;
			canEditBundles: boolean;
			canDeleteBundles: boolean;
			canCreateBundles: boolean;
			canViewItems: boolean;
		}>
	>({});
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [viewCountsById, setViewCountsById] = useState<{ [id: string]: number }>({});

	// Mutations
	const [triggerCollectionDelete] = useMutation(DELETE_COLLECTION);
	const [triggerCollectionInsert] = useMutation(INSERT_COLLECTION);
	const [triggerCollectionFragmentsInsert] = useMutation(INSERT_COLLECTION_FRAGMENTS);

	useEffect(() => {
		trackEvents(
			{
				object: bundleId,
				object_type: 'bundels' as any, // TODO remove cast after update typings
				message: `Gebruiker ${getProfileName(
					user
				)} heeft de pagina voor collectie ${bundleId} bekeken`,
				action: 'view',
			},
			user
		);

		// if (!relatedBundles) {
		// 	getRelatedItems(bundleId, 'bundles', 4)
		// 		.then((relatedBundles: Avo.Search.ResultItem[]) => setRelatedBundles(relatedBundles))
		// 		.catch((err: any) => {
		// 			console.error('Failed to get related items', err, {
		// 				bundleId,
		// 				index: 'bundles',
		// 				limit: 4,
		// 			});
		// 			toastService.danger(t('bundle/views/bundle-detail___het-ophalen-van-de-gerelateerde-bundels-is-mislukt'));
		// 		});
		// }
	}, [bundleId, relatedBundles, t, user]);

	useEffect(() => {
		const checkPermissionsAndGetBundle = async () => {
			const rawPermissions = await Promise.all([
				PermissionService.hasPermissions([{ name: PermissionNames.VIEW_BUNDLES }], user),
				PermissionService.hasPermissions(
					[
						{ name: PermissionNames.EDIT_OWN_BUNDLES, obj: bundleId },
						{ name: PermissionNames.EDIT_ANY_BUNDLES },
					],
					user
				),
				PermissionService.hasPermissions(
					[
						{ name: PermissionNames.DELETE_OWN_BUNDLES, obj: bundleId },
						{ name: PermissionNames.DELETE_ANY_BUNDLES },
					],
					user
				),
				PermissionService.hasPermissions([{ name: PermissionNames.CREATE_BUNDLES }], user),
				PermissionService.hasPermissions([{ name: PermissionNames.VIEW_ITEMS }], user),
			]);
			const permissionObj = {
				canViewBundles: rawPermissions[0],
				canEditBundles: rawPermissions[1],
				canDeleteBundles: rawPermissions[2],
				canCreateBundles: rawPermissions[3],
				canViewItems: rawPermissions[4],
			};
			const bundleObj = await CollectionService.getCollectionWithItems(bundleId, 'bundle');

			if (!bundleObj) {
				setLoadingInfo({
					state: 'error',
					message: t('bundle/views/bundle-detail___de-bundel-kon-niet-worden-gevonden'),
					icon: 'search',
				});
				return;
			}

			BookmarksViewsPlaysService.action('view', 'bundle', bundleObj.id, user);

			// Get view counts for each fragment
			try {
				setViewCountsById(
					await BookmarksViewsPlaysService.getMultipleViewCounts(
						bundleObj.collection_fragments.map(fragment => fragment.external_id),
						'collection'
					)
				);
			} catch (err) {
				console.error(new CustomError('Failed to get counts for bundle fragments', err, {}));
			}

			setPermissions(permissionObj);
			setBundle(bundleObj || null);
		};

		checkPermissionsAndGetBundle().catch(err => {
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
				message: t(
					'bundle/views/bundle-detail___er-ging-iets-mis-tijdens-het-ophalen-van-de-bundel'
				),
				icon: 'alert-triangle',
			});
		});
	}, [user, bundleId, setLoadingInfo, t]);

	useEffect(() => {
		if (!isEmpty(permissions) && bundle) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [permissions, bundle, setLoadingInfo]);

	// Listeners
	const onEditBundle = () => {
		redirectToClientPage(buildLink(APP_PATH.BUNDLE_EDIT, { id: bundleId }), history);
	};

	const onDeleteBundle = async () => {
		try {
			await triggerCollectionDelete({
				variables: {
					id: bundleId,
				},
				update: ApolloCacheManager.clearCollectionCache,
			});
			history.push(WORKSPACE_PATH.WORKSPACE);
			toastService.success(
				t('bundle/views/bundle-detail___de-bundel-werd-succesvol-verwijderd')
			);
		} catch (err) {
			console.error(err);
			toastService.danger(
				t('bundle/views/bundle-detail___het-verwijderen-van-de-bundel-is-mislukt')
			);
		}
	};

	const onClickDropdownItem = async (item: ReactText) => {
		setIsOptionsMenuOpen(false);

		switch (item) {
			case 'delete':
				setIsDeleteModalOpen(true);
				break;

			case 'duplicate':
				try {
					if (!bundle) {
						toastService.danger(
							t(
								'bundle/views/bundle-detail___de-bundel-kan-niet-gekopieerd-worden-omdat-deze-nog-niet-is-opgehaald-van-de-database'
							)
						);
						return;
					}
					const duplicateCollection = await CollectionService.duplicateCollection(
						bundle,
						user,
						COLLECTION_COPY,
						COLLECTION_COPY_REGEX,
						triggerCollectionInsert,
						triggerCollectionFragmentsInsert
					);
					redirectToClientPage(
						buildLink(APP_PATH.BUNDLE_DETAIL, { id: duplicateCollection.id }),
						history
					);
					setBundle(duplicateCollection);
					toastService.success(
						t(
							'bundle/views/bundle-detail___de-bundel-is-gekopieerd-u-kijkt-nu-naar-de-kopie'
						)
					);
				} catch (err) {
					console.error('Failed to copy bundle', err, { originalBundle: bundle });
					toastService.danger(
						t('bundle/views/bundle-detail___het-kopieren-van-de-bundel-is-mislukt')
					);
				}
				break;

			default:
				return null;
		}
	};

	// Render functions
	const renderRelatedBundles = () => {
		if (!relatedBundles || !relatedBundles.length) {
			return (
				<Spacer margin="left-small">
					<p className="c-body-1">
						<Trans i18nKey="bundle/views/bundle-detail___de-gerelateerde-bundels-konden-niet-worden-opgehaald">
							De gerelateerde bundels konden niet worden opgehaald.
						</Trans>
					</p>
				</Spacer>
			);
		}

		relatedBundles.map((relatedBundle: Avo.Search.ResultItem) => {
			return (
				<Column size="3-3" key={`related-bundle-${relatedBundle.id}`}>
					<MediaCard
						className="u-clickable"
						category="bundle"
						onClick={() =>
							redirectToClientPage(
								buildLink(APP_PATH.BUNDLE_DETAIL, { id: relatedBundle.id }),
								history
							)
						}
						orientation="vertical"
						title={relatedBundle.dc_title}
					>
						<MediaCardThumbnail>
							<Thumbnail
								category="bundle"
								src={relatedBundle.thumbnail_path}
								meta={t(
									'bundle/views/bundle-detail___num-of-collection-fragments-items',
									{
										numOfCollectionFragments: 3 /*relatedBundle.numOfCollectionFragments*/,
									}
								)}
							/>
						</MediaCardThumbnail>
						<MediaCardMetaData>
							<MetaData category="bundle">
								<MetaDataItem label={'300'} icon="eye" />
								{/*<MetaDataItem label={fromNow(relatedBundle.updated_at)} />*/}
								<MetaDataItem label={fromNow(relatedBundle.original_cp || '')} />
							</MetaData>
						</MediaCardMetaData>
					</MediaCard>
				</Column>
			);
		});
	};

	function renderCollectionFragments() {
		if (!bundle) {
			return null;
		}
		return (bundle.collection_fragments || []).map((fragment: Avo.Collection.Fragment) => {
			const collection: Avo.Collection.Collection = (fragment.item_meta as unknown) as Avo.Collection.Collection; // TODO update with new typings type
			if (!collection) {
				return null;
			}
			return (
				<Column size="3-4" key={`bundle-fragment-${fragment.id}`}>
					<MediaCard
						className="u-clickable"
						category="bundle"
						onClick={() =>
							redirectToClientPage(
								buildLink(APP_PATH.COLLECTION_DETAIL, { id: collection.id }),
								history
							)
						}
						orientation="vertical"
						title={collection.title}
					>
						<MediaCardThumbnail>
							<Thumbnail
								category="collection"
								src={collection.thumbnail_path || undefined}
							/>
						</MediaCardThumbnail>
						<MediaCardMetaData>
							<MetaData category="collection">
								<MetaDataItem
									label={String(viewCountsById[fragment.external_id] || 0)}
									icon="eye"
								/>
								<MetaDataItem label={fromNow(collection.updated_at)} />
							</MetaData>
						</MediaCardMetaData>
					</MediaCard>
				</Column>
			);
		});
	}

	const renderBundle = () => {
		const {
			is_public,
			thumbnail_path,
			title,
			description,
			lom_context,
			lom_classification,
		} = bundle as Avo.Collection.Collection;

		if (!isFirstRender) {
			setIsPublic(is_public);
			setIsFirstRender(true);
		}

		const tags = [
			...(lom_classification || []).map(
				(classification): TagOption => ({ id: classification, label: classification })
			),
			...(lom_context || []).map((context): TagOption => ({ id: context, label: context })),
		];

		const BUNDLE_DROPDOWN_ITEMS = [
			...(permissions.canCreateBundles
				? [
						createDropdownMenuItem(
							'duplicate',
							t('bundle/views/bundle-detail___dupliceer'),
							'copy'
						),
				  ]
				: []),
			...(permissions.canDeleteBundles
				? [createDropdownMenuItem('delete', t('bundle/views/bundle-detail___verwijder'))]
				: []),
		];

		const organisationName = get(
			bundle,
			'organisation.name',
			t('bundle/views/bundle-detail___onbekende-uitgever')
		);
		const organisationLogo = get(bundle, 'organisation.logo_url', null);

		return (
			<>
				<Container mode="vertical" background="alt">
					<Container mode="horizontal">
						<Grid>
							<Column size="3-2">
								<Spacer margin="right-large">
									<Thumbnail
										category="bundle"
										src={thumbnail_path || undefined}
									/>
								</Spacer>
							</Column>
							<Column size="3-10">
								<Toolbar autoHeight>
									<ToolbarLeft>
										<ToolbarItem>
											<span className="c-overline u-text-muted">
												{is_public
													? t(
															'bundle/views/bundle-detail___openbare-bundel'
													  )
													: t(
															'bundle/views/bundle-detail___prive-bundel'
													  )}
											</span>
											<Spacer margin="top-small">
												<h1 className="c-h1 u-m-0">{title}</h1>
											</Spacer>
										</ToolbarItem>
									</ToolbarLeft>
									<ToolbarRight>
										<ToolbarItem>
											<ButtonToolbar>
												<Button
													label={t('bundle/views/bundle-detail___delen')}
													onClick={() => setIsShareModalOpen(true)}
													type="secondary"
												/>
												<Button
													label={t(
														'bundle/views/bundle-detail___bewerken'
													)}
													onClick={onEditBundle}
													type="primary"
												/>
												<Button
													title={t(
														'bundle/views/bundle-detail___share-bundel'
													)}
													type="secondary"
													icon="share-2"
													ariaLabel={t(
														'bundle/views/bundle-detail___share-bundel'
													)}
													onClick={() =>
														setIsShareThroughEmailModalOpen(true)
													}
												/>
												<ControlledDropdown
													isOpen={isOptionsMenuOpen}
													menuWidth="fit-content"
													onOpen={() => setIsOptionsMenuOpen(true)}
													onClose={() => setIsOptionsMenuOpen(false)}
													placement="bottom-end"
												>
													<DropdownButton>
														<Button
															type="secondary"
															icon="more-horizontal"
															ariaLabel={t(
																'collection/views/collection-detail___meer-opties'
															)}
															title={t(
																'collection/views/collection-detail___meer-opties'
															)}
														/>
													</DropdownButton>
													<DropdownContent>
														<MenuContent
															menuItems={BUNDLE_DROPDOWN_ITEMS}
															onClick={onClickDropdownItem}
														/>
													</DropdownContent>
												</ControlledDropdown>
											</ButtonToolbar>
										</ToolbarItem>
									</ToolbarRight>
								</Toolbar>
								<p className="c-body-1">{description}</p>
								<Flex spaced="regular" wrap>
									<FlexItem className="c-avatar-and-text">
										<Avatar
											image={organisationLogo}
											title={organisationName}
											dark
										/>
									</FlexItem>
									<TagList tags={tags} />
								</Flex>
							</Column>
						</Grid>
					</Container>
				</Container>
				<Container mode="vertical">
					<Container mode="horizontal">
						<div className="c-media-card-list">
							<Grid>{renderCollectionFragments()}</Grid>
						</div>
					</Container>
				</Container>
				<Container mode="vertical" background="alt">
					<Container mode="horizontal">
						<BlockHeading type="h3">
							<Trans i18nKey="bundle/views/bundle-detail___aanbevolen-bundels">
								Aanbevolen bundels
							</Trans>
						</BlockHeading>
						<div className="c-media-card-list">
							<Grid>{renderRelatedBundles()}</Grid>
						</div>
					</Container>
				</Container>
				{isPublic !== null && (
					<ShareCollectionModal
						collection={{
							...(bundle as Avo.Collection.Collection),
							is_public: isPublic,
						}}
						isOpen={isShareModalOpen}
						onClose={() => setIsShareModalOpen(false)}
						setIsPublic={setIsPublic}
						history={history}
						location={location}
						match={match}
						user={user}
					/>
				)}
				<DeleteObjectModal
					title={t(
						'bundle/views/bundle-detail___ben-je-zeker-dat-je-deze-bundel-wil-verwijderen'
					)}
					body={t(
						'bundle/views/bundle-detail___deze-actie-kan-niet-ongedaan-gemaakt-worden'
					)}
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					deleteObjectCallback={() => onDeleteBundle()}
				/>
				<ShareThroughEmailModal
					modalTitle={t('bundle/views/bundle-detail___deel-deze-bundel')}
					type="bundle"
					emailLinkHref={window.location.href}
					emailLinkTitle={(bundle as Avo.Collection.Collection).title}
					isOpen={isShareThroughEmailModalOpen}
					onClose={() => setIsShareThroughEmailModalOpen(false)}
				/>
			</>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			render={renderBundle}
			dataObject={permissions}
			loadingInfo={loadingInfo}
			showSpinner={true}
		/>
	);
};

export default withRouter(BundleDetail);
