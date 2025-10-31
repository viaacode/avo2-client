import { toggleSortOrder } from '@meemoo/admin-core-ui/admin';
import { PaginationBar } from '@meemoo/react-components';
import { QueryClient } from '@tanstack/react-query';
import {
	Button,
	ButtonToolbar,
	Icon,
	IconName,
	MetaData,
	MetaDataItem,
	Spacer,
	Table,
	type TableColumn,
	Thumbnail,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
} from '@viaa/avo2-components';
import { type Avo, PermissionName, ShareWithColleagueTypeEnum } from '@viaa/avo2-types';
import { useAtomValue } from 'jotai';
import { cloneDeep, compact, fromPairs, isNil, noop } from 'lodash-es';
import React, {
	type FC,
	type ReactNode,
	type ReactText,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { ArrayParam, NumberParam, StringParam, useQueryParams } from 'use-query-params';

import { type CollectionsOrBundlesOverviewTableCols } from '../../admin/collectionsOrBundles/collections-or-bundles.types';
import { GET_DEFAULT_PAGINATION_BAR_PROPS } from '../../admin/shared/components/PaginationBar/PaginationBar.consts';
import { AssignmentService } from '../../assignment/assignment.service';
import { CreateAssignmentModal } from '../../assignment/modals/CreateAssignmentModal';
import { commonUserAtom } from '../../authentication/authentication.store';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views/ErrorView';
import { OrderDirection } from '../../search/search.const';
import {
	CheckboxDropdownModal,
	type CheckboxOption,
} from '../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { MoreOptionsDropdownWrapper } from '../../shared/components/MoreOptionsDropdownWrapper/MoreOptionsDropdownWrapper';
import { QuickLaneTypeEnum } from '../../shared/components/QuickLaneContent/QuickLaneContent.types';
import { QuickLaneModal } from '../../shared/components/QuickLaneModal/QuickLaneModal';
import { getMoreOptionsLabel } from '../../shared/constants';
import { useDeleteCollectionOrBundleByUuidMutation } from '../../shared/generated/graphql-db-react-query';
import { buildLink } from '../../shared/helpers/build-link';
import { createDropdownMenuItem } from '../../shared/helpers/dropdown';
import { formatDate, formatTimestamp } from '../../shared/helpers/formatters';
import { getOrderObject } from '../../shared/helpers/generate-order-gql-query';
import { navigate } from '../../shared/helpers/link';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { renderMobileDesktop } from '../../shared/helpers/renderMobileDesktop';
import { createShareIconTableOverview } from '../../shared/helpers/share-icon-table-overview';
import { ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';
import { truncateTableValue } from '../../shared/helpers/truncate';
import { useTranslation } from '../../shared/hooks/useTranslation';
import { COLLECTION_QUERY_KEYS } from '../../shared/services/data-service';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { ITEMS_PER_PAGE } from '../../workspace/workspace.const';
import { CollectionService } from '../collection.service';
import {
	type Collection,
	CollectionCreateUpdateTab,
	CollectionMenuAction,
	CollectionOrBundle,
	CollectionShareType,
	ContentTypeNumber,
} from '../collection.types';
import { deleteCollection, deleteSelfFromCollection } from '../helpers/delete-collection';

import { COLLECTIONS_OR_BUNDLES_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT } from './CollectionOrBundleOverview.consts';
import { DeleteCollectionModal } from './modals/DeleteCollectionModal';
import { DeleteMyselfFromCollectionContributorsConfirmModal } from './modals/DeleteContributorFromCollectionModal';

import './CollectionOrBundleOverview.scss';

interface CollectionOrBundleOverviewProps {
	numberOfItems: number;
	type: CollectionOrBundle;
	onUpdate: () => void | Promise<void>;
}

export const CollectionOrBundleOverview: FC<CollectionOrBundleOverviewProps> = ({
	numberOfItems,
	type,
	onUpdate = noop,
}) => {
	const { tText, tHtml } = useTranslation();
	const navigateFunc = useNavigate();
	const commonUser = useAtomValue(commonUserAtom);

	// State
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [collections, setCollections] = useState<Collection[] | null>(null);
	const [permissions, setPermissions] = useState<{
		[collectionUuid: string]: {
			canEdit?: boolean;
			canDelete?: boolean;
		};
	}>({});
	const [showPublicState, setShowPublicState] = useState(false);

	const [dropdownOpenForCollectionUuid, setDropdownOpenForCollectionUuid] = useState<
		string | null
	>(null);
	const [selectedCollectionDetail, setSelectedCollectionDetail] = useState<
		Avo.Collection.Collection | undefined
	>(undefined);
	const [selectedCollection, setSelectedCollection] = useState<Collection | undefined>(undefined);
	const [sortColumn, setSortColumn] =
		useState<CollectionsOrBundlesOverviewTableCols>('updated_at');
	const [sortOrder, setSortOrder] = useState<OrderDirection>(OrderDirection.desc);
	const [page, setPage] = useState<number>(0);
	const [activeModalInfo, setActiveModalInfo] = useState<{
		collectionUuid: string;
		activeModal:
			| 'DELETE-COLLECTION'
			| 'DELETE-CONTRIBUTOR'
			| 'QUICK_LANE'
			| 'CREATE_ASSIGNMENT';
	} | null>(null);

	const [query, setQuery] = useQueryParams({
		selectedShareTypeLabelIds: ArrayParam,
		page: NumberParam,
		sortColumn: StringParam,
		sortOrder: StringParam,
	});

	const isContributor =
		selectedCollection?.share_type === ShareWithColleagueTypeEnum.GEDEELD_MET_MIJ;
	const isOwner =
		selectedCollection?.share_type === ShareWithColleagueTypeEnum.GEDEELD_MET_ANDERE ||
		selectedCollection?.share_type === ShareWithColleagueTypeEnum.NIET_GEDEELD;
	const hasDeleteRightsForAllCollections =
		commonUser?.permissions?.includes(PermissionName.DELETE_ANY_COLLECTIONS) || false;
	const shouldDeleteSelfFromCollection =
		isContributor && !hasDeleteRightsForAllCollections && !isOwner;

	// Mutations
	const { mutateAsync: triggerCollectionOrBundleDelete } =
		useDeleteCollectionOrBundleByUuidMutation();

	const isCollection = type === 'collection';

	const getColumnsMobile = (): TableColumn[] => {
		return [
			{ id: 'thumbnail', label: '', col: '2' },
			{
				id: 'title',
				label: tText('collection/views/collection-overview___titel'),
				col: '6',
				sortable: true,
				dataType: TableColumnDataType.string,
			},
			{
				id: ACTIONS_TABLE_COLUMN_ID,
				tooltip: tText('collection/components/collection-or-bundle-overview___acties'),
				col: '1',
			},
		];
	};

	const getColumnsDesktop = useCallback((): TableColumn[] => {
		return [
			{
				id: 'thumbnail',
				tooltip: tText('collection/components/collection-or-bundle-overview___cover'),
				col: '2',
			},
			{
				id: 'title',
				label: tText('collection/views/collection-overview___titel'),
				col: '6',
				sortable: true,
				dataType: TableColumnDataType.string,
			},
			{
				id: 'updated_at',
				label: tText('collection/views/collection-overview___laatst-bewerkt'),
				col: '3',
				sortable: true,
				dataType: TableColumnDataType.dateTime,
			},
			...(isCollection
				? [
						{
							id: 'share_type',
							label: tText('collection/collection___gedeeld'),
							sortable: true,
							dataType: TableColumnDataType.string,
						},
				  ]
				: []),
			...(showPublicState
				? [
						{
							id: 'is_public',
							label: tText(
								'collection/components/collection-or-bundle-overview___is-publiek'
							),
							col: '2',
							sortable: true,
							dataType: TableColumnDataType.boolean,
						} as TableColumn,
				  ]
				: []),
			// TODO re-enable once we can put collections in folders https://meemoo.atlassian.net/browse/AVO-591
			// ...(isCollection
			// 	? [
			// 			{
			// 				id: 'inFolder',
			// 				label: tText('collection/views/collection-overview___in-map'),
			// 				col: '2' as any,
			// 			},
			// 	  ]
			// 	: []),
			// TODO re-enable once users can give share collection view/edit rights with other users
			// {
			// 	id: 'access',
			// 	label: tText('collection/views/collection-overview___toegang'),
			// 	col: '2',
			// },
			{
				id: ACTIONS_TABLE_COLUMN_ID,
				tooltip: tText('collection/components/collection-or-bundle-overview___acties'),
				col: '1',
			},
		];
	}, [isCollection, showPublicState, tText]);

	const fetchCollections = useCallback(async () => {
		try {
			const column = getColumnsDesktop().find(
				(tableColumn: any) => tableColumn.id || '' === (sortColumn as any)
			);
			const columnDataType = (column?.dataType ||
				TableColumnDataType.string) as TableColumnDataType;
			const collections =
				await CollectionService.fetchCollectionsByOwnerOrContributorProfileId(
					commonUser,
					page * ITEMS_PER_PAGE,
					ITEMS_PER_PAGE,
					getOrderObject(
						sortColumn,
						sortOrder,
						columnDataType,
						COLLECTIONS_OR_BUNDLES_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT
					),
					isCollection ? ContentTypeNumber.collection : ContentTypeNumber.bundle,
					undefined,
					query.selectedShareTypeLabelIds as string[]
				);

			// Check edit and delete permissions for every row, so we can show the correct dropdown list of operations
			let perms: Record<string, boolean>[];

			if (isCollection) {
				perms = await Promise.all(
					(collections || []).map(
						async (collection: Partial<Avo.Collection.Collection>) => {
							return await PermissionService.checkPermissions(
								{
									canEdit: [
										{
											name: PermissionName.EDIT_OWN_COLLECTIONS,
											obj: collection,
										},
										{ name: PermissionName.EDIT_ANY_COLLECTIONS },
									],
									canDelete: [
										{
											name: PermissionName.DELETE_OWN_COLLECTIONS,
											obj: collection,
										},
										{ name: PermissionName.DELETE_ANY_COLLECTIONS },
									],
								},
								commonUser
							);
						}
					)
				);
			} else {
				// bundles
				perms = await Promise.all(
					collections.map(async (bundle: Partial<Avo.Collection.Collection>) => {
						return await PermissionService.checkPermissions(
							{
								canEdit: [
									{
										name: PermissionName.EDIT_OWN_BUNDLES,
										obj: bundle,
									},
									{ name: PermissionName.EDIT_ANY_BUNDLES },
								],
								canDelete: [
									{
										name: PermissionName.DELETE_OWN_BUNDLES,
										obj: bundle,
									},
									{ name: PermissionName.DELETE_ANY_BUNDLES },
								],
							},
							commonUser
						);
					})
				);
			}
			setPermissions(
				fromPairs(
					perms.map((permsForCollection: Record<string, boolean>, index: number) => [
						collections[index].id,
						permsForCollection,
					])
				)
			);
			setCollections(collections as unknown as Collection[]);
		} catch (err) {
			console.error('Failed to fetch collections', err, {});
			setLoadingInfo({
				state: 'error',
				message: isCollection
					? tText(
							'collection/components/collection-or-bundle-overview___het-ophalen-van-de-collecties-is-mislukt'
					  )
					: tText(
							'collection/components/collection-or-bundle-overview___het-ophalen-van-de-bundels-is-mislukt'
					  ),
				actionButtons: ['home'],
			});
		}
	}, [
		getColumnsDesktop,
		commonUser,
		page,
		sortColumn,
		sortOrder,
		isCollection,
		query.selectedShareTypeLabelIds,
		tText,
	]);

	useEffect(() => {
		fetchCollections().then(noop);
	}, [fetchCollections]);

	useEffect(() => {
		PermissionService.hasPermissions(
			[
				{
					name: isCollection
						? PermissionName.PUBLISH_OWN_COLLECTIONS
						: PermissionName.PUBLISH_OWN_BUNDLES,
				},
				{
					name: isCollection
						? PermissionName.PUBLISH_ANY_COLLECTIONS
						: PermissionName.PUBLISH_ANY_BUNDLES,
				},
			],
			commonUser
		).then((showPublicState) => setShowPublicState(showPublicState));
	}, [setShowPublicState, isCollection, commonUser]);

	useEffect(() => {
		if (collections) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [setLoadingInfo, collections]);

	useEffect(() => {
		if (activeModalInfo?.collectionUuid) {
			CollectionService.fetchCollectionOrBundleByIdOrInviteToken(
				activeModalInfo?.collectionUuid,
				isCollection ? CollectionOrBundle.COLLECTION : CollectionOrBundle.BUNDLE,
				undefined
			).then((res) => setSelectedCollectionDetail(res || undefined));
			setSelectedCollection(
				collections?.find((collection) => collection.id === activeModalInfo?.collectionUuid)
			);
		} else {
			setSelectedCollection(undefined);
			setSelectedCollectionDetail(undefined);
		}
	}, [activeModalInfo?.collectionUuid, isCollection]);

	useEffect(() => {
		if (query.sortColumn) {
			setSortColumn(query.sortColumn as CollectionsOrBundlesOverviewTableCols);
		}
		if (query.sortOrder) {
			setSortOrder(query.sortOrder as OrderDirection);
		}
	}, []);

	const handleQueryChanged = (value: any, id: string) => {
		let newQuery: any = cloneDeep(query);
		let newValue = value;
		// Show both shareTypes for 'mijn collecties' option
		if (value.includes(CollectionShareType.NIET_GEDEELD)) {
			newValue = [...value, CollectionShareType.GEDEELD_MET_ANDERE];
		}

		newQuery = {
			...newQuery,
			[id]: newValue,
			...(id !== 'page' ? { page: 0 } : {}), // Reset the page to 0, when any filter or sort order change is made
		};

		setQuery(newQuery, 'pushIn');
	};

	const handleDeleteCollection = async () => {
		await deleteCollection(
			activeModalInfo?.collectionUuid,
			commonUser,
			isCollection,
			async () => {
				await triggerCollectionOrBundleDelete(
					{
						collectionOrBundleUuid: activeModalInfo?.collectionUuid,
						collectionOrBundleUuidAsText: activeModalInfo?.collectionUuid as string,
					},
					{
						onSuccess: async () => {
							const queryClient = new QueryClient();
							await queryClient.invalidateQueries(COLLECTION_QUERY_KEYS);
						},
					}
				);
			},
			() => {
				onUpdate();
				fetchCollections();
			}
		);

		setActiveModalInfo(null);
	};

	const handleDeleteSelfFromCollection = async () => {
		await deleteSelfFromCollection(activeModalInfo?.collectionUuid, commonUser, () => {
			onUpdate();
			fetchCollections();
		});

		setActiveModalInfo(null);
	};

	const onClickCreate = () =>
		navigateFunc(
			buildLink(
				APP_PATH.SEARCH.route,
				{},
				isCollection
					? { filters: '{"type":["video","audio"]}' }
					: { filters: '{"type":["collectie"]}' }
			)
		);

	// TODO: Make shared function because also used in assignments
	const onClickColumn = (columnId: CollectionsOrBundlesOverviewTableCols) => {
		if (sortColumn === columnId) {
			// Change column sort order
			setSortOrder(toggleSortOrder(sortOrder));
		} else {
			// Initial column sort order
			setSortColumn(columnId);
			setSortOrder(OrderDirection.asc);
		}
	};

	const onCreateAssignmentFromCollection = async (withDescription: boolean): Promise<void> => {
		const collection = await CollectionService.fetchCollectionOrBundleByIdOrInviteToken(
			activeModalInfo?.collectionUuid as string,
			CollectionOrBundle.COLLECTION,
			undefined
		);
		if (collection && commonUser) {
			const assignmentId = await AssignmentService.createAssignmentFromCollection(
				commonUser,
				collection,
				withDescription
			);

			navigateFunc(buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, { id: assignmentId }));
		}
	};

	// Render functions
	const getLinkProps = (
		id: string,
		title: string
	): {
		to: string;
		title: string;
	} => ({
		title,
		to: buildLink(
			isCollection ? APP_PATH.COLLECTION_DETAIL.route : APP_PATH.BUNDLE_DETAIL.route,
			{
				id,
			}
		),
	});

	const renderThumbnail = ({ id, title, thumbnail_path }: Collection) => (
		<Link {...getLinkProps(id, title || '')}>
			<Thumbnail
				alt="thumbnail"
				category={type}
				className="m-collection-overview-thumbnail"
				src={thumbnail_path || undefined}
			/>
		</Link>
	);

	const renderTitle = (collection: Collection) => (
		<div className="c-content-header">
			<h3 className="c-content-header__header">
				<Link {...getLinkProps(collection.id, collection.title || '')}>
					{truncateTableValue(collection.title)}
				</Link>
			</h3>
			<div className="c-content-header__meta u-text-muted">
				<MetaData category={type}>
					<MetaDataItem>
						<span title={`Aangemaakt: ${formatDate(collection.created_at)}`}>
							{formatDate(collection.created_at)}
						</span>
					</MetaDataItem>
					<MetaDataItem
						icon={IconName.eye}
						label={String(collection?.view_count?.count || 0)}
					/>
				</MetaData>
			</div>
		</div>
	);

	const renderActions = (collectionUuid: string) => {
		const ROW_DROPDOWN_ITEMS = [
			...createDropdownMenuItem(
				collectionUuid,
				CollectionMenuAction.editCollection,
				tText('collection/views/collection-overview___bewerk'),
				'edit2',
				(permissions[collectionUuid] && permissions[collectionUuid].canEdit) || false
			),
			...createDropdownMenuItem(
				collectionUuid,
				CollectionMenuAction.createAssignment,
				tText('collection/views/collection-overview___maak-opdracht'),
				'clipboard',
				(isCollection &&
					PermissionService.hasPerm(commonUser, PermissionName.CREATE_ASSIGNMENTS)) ||
					false
			),
			...createDropdownMenuItem(
				collectionUuid,
				CollectionMenuAction.openQuickLane,
				tText('collection/views/collection-overview___delen-met-leerlingen'),
				'link-2',
				isCollection &&
					PermissionService.hasPerm(commonUser, PermissionName.CREATE_QUICK_LANE)
			),
			...createDropdownMenuItem(
				collectionUuid,
				CollectionMenuAction.deleteCollection,
				tText('collection/views/collection-overview___verwijderen'),
				'trash',
				!shouldDeleteSelfFromCollection
			),
			...createDropdownMenuItem(
				collectionUuid,
				CollectionMenuAction.deleteContributor,
				tText(
					'collection/components/collection-or-bundle-overview___verwijder-mij-van-deze-collectie'
				),
				'trash',
				shouldDeleteSelfFromCollection
			),
		];

		// Listeners
		const onClickDropdownItem = (item: ReactText) => {
			switch (item) {
				case CollectionMenuAction.editCollection:
					navigate(
						navigateFunc,
						isCollection
							? APP_PATH.COLLECTION_EDIT_TAB.route
							: APP_PATH.BUNDLE_EDIT_TAB.route,
						{ id: collectionUuid, tabId: CollectionCreateUpdateTab.CONTENT }
					);
					break;

				case CollectionMenuAction.createAssignment:
					setActiveModalInfo({
						collectionUuid,
						activeModal: 'CREATE_ASSIGNMENT',
					});
					break;

				case CollectionMenuAction.openQuickLane:
					setActiveModalInfo({
						collectionUuid,
						activeModal: 'QUICK_LANE',
					});
					break;

				case CollectionMenuAction.deleteCollection:
					setActiveModalInfo({
						collectionUuid,
						activeModal: 'DELETE-COLLECTION',
					});
					break;

				case CollectionMenuAction.deleteContributor:
					setActiveModalInfo({
						collectionUuid,
						activeModal: 'DELETE-CONTRIBUTOR',
					});
					break;

				default:
					return null;
			}
		};

		if (!ROW_DROPDOWN_ITEMS.length) {
			return null;
		}

		return (
			<ButtonToolbar>
				<MoreOptionsDropdownWrapper
					isOpen={dropdownOpenForCollectionUuid === collectionUuid}
					onOpen={() => {
						setSelectedCollection(collections?.find((c) => c.id === collectionUuid));
						setDropdownOpenForCollectionUuid(null);
						// Allow rerender to close other menu, before opening new one. Otherwise, both close
						setTimeout(() => setDropdownOpenForCollectionUuid(collectionUuid), 10);
					}}
					onClose={() => {
						setDropdownOpenForCollectionUuid(null);
					}}
					label={getMoreOptionsLabel()}
					menuItems={ROW_DROPDOWN_ITEMS}
					onOptionClicked={onClickDropdownItem}
				/>

				{renderMobileDesktop({
					mobile: null,
					desktop: (
						<Button
							icon={IconName.chevronRight}
							onClick={() =>
								navigate(
									navigateFunc,
									isCollection
										? APP_PATH.COLLECTION_DETAIL.route
										: APP_PATH.BUNDLE_DETAIL.route,
									{ id: collectionUuid }
								)
							}
							title={
								isCollection
									? tText(
											'collection/components/collection-or-bundle-overview___bekijk-deze-collectie'
									  )
									: tText(
											'collection/components/collection-or-bundle-overview___bekijk-deze-bundel'
									  )
							}
							type="borderless"
						/>
					),
				})}
			</ButtonToolbar>
		);
	};

	const renderCell = (collection: Collection, colKey: string) => {
		const { id } = collection;

		switch (colKey) {
			case 'thumbnail':
				return renderThumbnail(collection);

			case 'title':
				return renderTitle(collection);

			case 'inFolder': {
				const isInFolder = true; // TODO: Check if collection is in bundle
				return isInFolder && <Button icon={IconName.folder} type="borderless" />;
			}

			case 'is_public':
				return (
					<div
						title={
							collection.is_public
								? tText(
										'collection/components/collection-or-bundle-overview___publiek'
								  )
								: tText(
										'collection/components/collection-or-bundle-overview___niet-publiek'
								  )
						}
					>
						<Icon name={collection.is_public ? IconName.unlock3 : IconName.lock} />
					</div>
				);

			// TODO re-enable once users can give share collection view/edit rights with other users
			// case 'access':
			// 	const userProfiles: Avo.User.Profile[] = compact([profile]); // TODO: Get all users that are allowed to edit this collection
			// 	const avatarProps = userProfiles.map(userProfile => {
			// 		const props = getAvatarProps(userProfile);
			// 		(props as any).subtitle = 'mag bewerken'; // TODO: Check permissions for all users
			// 		return props;
			// 	});
			//
			// 	return userProfiles && <AvatarList avatars={avatarProps} isOpen={false} />;

			case ACTIONS_TABLE_COLUMN_ID:
				return renderActions(id);

			case 'created_at':
			case 'updated_at': {
				const cellData = collection[colKey as 'created_at' | 'updated_at'];
				return <span title={formatTimestamp(cellData)}>{formatDate(cellData)}</span>;
			}

			case 'share_type':
				return createShareIconTableOverview(
					collection.share_type as ShareWithColleagueTypeEnum | undefined,
					collection.contributors as unknown as
						| Avo.Collection.Contributor[]
						| null
						| undefined,
					'collection',
					'm-collection-overview-shared'
				);

			default:
				return null;
		}
	};

	const renderPagination = () => (
		<PaginationBar
			{...GET_DEFAULT_PAGINATION_BAR_PROPS()}
			startItem={page * ITEMS_PER_PAGE}
			itemsPerPage={ITEMS_PER_PAGE}
			totalItems={numberOfItems}
			onPageChange={setPage}
		/>
	);

	const getLabelOptions = (): CheckboxOption[] => {
		return compact([
			{
				label: tText('collection/views/collection-overview___gedeeld-met-mij'),
				id: CollectionShareType.GEDEELD_MET_MIJ,
				checked: [...(query.selectedShareTypeLabelIds || [])].includes(
					CollectionShareType.GEDEELD_MET_MIJ
				),
			},
			{
				label: tText('collection/views/collection-overview___mijn-collecties'),
				id: CollectionShareType.NIET_GEDEELD,
				checked: [...(query.selectedShareTypeLabelIds || [])].includes(
					CollectionShareType.NIET_GEDEELD
				),
			},
		]);
	};

	const renderHeader = () => {
		return (
			<Toolbar>
				<ToolbarLeft>
					<ToolbarItem>
						<ButtonToolbar>
							<CheckboxDropdownModal
								label={tText('collection/views/collection-overview___soort')}
								id="share_type"
								options={getLabelOptions()}
								onChange={(selectedShareTypeLabels) =>
									handleQueryChanged(
										selectedShareTypeLabels,
										'selectedShareTypeLabelIds'
									)
								}
							/>
						</ButtonToolbar>
					</ToolbarItem>
				</ToolbarLeft>
			</Toolbar>
		);
	};

	const renderTable = (collections: Collection[]) => {
		return (
			<>
				<Table
					columns={isMobileWidth() ? getColumnsMobile() : getColumnsDesktop()}
					data={collections}
					emptyStateMessage={tText(
						'collection/views/collection-overview___geen-resultaten-gevonden'
					)}
					renderCell={renderCell}
					rowKey="id"
					variant="styled"
					onColumnClick={onClickColumn as any}
					sortColumn={sortColumn}
					sortOrder={sortOrder}
				/>
				<Spacer margin="top-large">{renderPagination()}</Spacer>
			</>
		);
	};

	const renderEmptyFallback = () => (
		<ErrorView
			icon={isCollection ? IconName.collection : IconName.folder}
			message={
				isCollection
					? tHtml(
							'collection/views/collection-overview___je-hebt-nog-geen-collecties-aangemaakt'
					  )
					: tHtml(
							'collection/components/collection-or-bundle-overview___je-hebt-nog-geen-bundels-aangemaakt'
					  )
			}
		>
			<p>
				{isCollection
					? tHtml(
							'collection/views/collection-overview___beschrijving-hoe-collecties-aan-te-maken'
					  )
					: tHtml(
							'collection/components/collection-or-bundle-overview___collection-components-beschrijving-hoe-collecties-aan-te-maken'
					  )}
			</p>
			<Spacer margin="top">
				<Button
					type="primary"
					icon={IconName.search}
					autoHeight
					label={
						isCollection
							? tText(
									'collection/views/collection-overview___maak-je-eerste-collectie'
							  )
							: tText(
									'collection/components/collection-or-bundle-overview___zoek-een-collectie-en-maak-je-eerste-bundel'
							  )
					}
					onClick={onClickCreate}
				/>
			</Spacer>
		</ErrorView>
	);

	const renderDeleteModal = (): ReactNode | null => {
		if (isCollection) {
			// Collection
			if (activeModalInfo?.activeModal === 'DELETE-COLLECTION') {
				return (
					<DeleteCollectionModal
						isOpen={activeModalInfo?.activeModal === 'DELETE-COLLECTION'}
						onClose={() => setActiveModalInfo(null)}
						deleteCallback={handleDeleteCollection}
						contributorCount={selectedCollectionDetail?.contributors?.length || 0}
						isCollection={isCollection}
					/>
				);
			} else if (activeModalInfo?.activeModal === 'DELETE-CONTRIBUTOR') {
				return (
					<DeleteMyselfFromCollectionContributorsConfirmModal
						isOpen={activeModalInfo?.activeModal === 'DELETE-CONTRIBUTOR'}
						onClose={() => setActiveModalInfo(null)}
						deleteCallback={handleDeleteSelfFromCollection}
					/>
				);
			}
		} else if (activeModalInfo?.activeModal === 'DELETE-COLLECTION') {
			// Bundle
			return (
				<DeleteCollectionModal
					isOpen={activeModalInfo?.activeModal === 'DELETE-COLLECTION'}
					onClose={() => setActiveModalInfo(null)}
					deleteCallback={handleDeleteCollection}
					contributorCount={0}
					isCollection={isCollection}
				/>
			);
		}
		return null;
	};

	const renderQuickLaneModal = () => {
		return (
			selectedCollectionDetail && (
				<QuickLaneModal
					modalTitle={tHtml(
						'collection/views/collection-overview___delen-met-leerlingen'
					)}
					isOpen={activeModalInfo?.activeModal === 'QUICK_LANE'}
					content={selectedCollectionDetail}
					content_label={QuickLaneTypeEnum.COLLECTION}
					onClose={() => setActiveModalInfo(null)}
					onUpdate={() => fetchCollections()}
				/>
			)
		);
	};

	const renderCreateAssignmentModal = () => {
		return (
			<CreateAssignmentModal
				isOpen={activeModalInfo?.activeModal === 'CREATE_ASSIGNMENT'}
				onClose={() => setActiveModalInfo(null)}
				createAssignmentCallback={onCreateAssignmentFromCollection}
				translations={{
					title: tHtml(
						'collection/components/collection-or-bundle-overview___maak-nieuwe-opdracht'
					),
					primaryButton: tText(
						'collection/components/collection-or-bundle-overview___maak-opdracht'
					),
					secondaryButton: tText(
						'collection/components/collection-or-bundle-overview___annuleer'
					),
				}}
			/>
		);
	};

	const renderCollections = () => {
		return (
			<>
				{isCollection && renderHeader()}
				{collections && collections.length
					? renderTable(collections)
					: renderEmptyFallback()}
				{!isNil(activeModalInfo?.collectionUuid) && renderDeleteModal()}
				{renderQuickLaneModal()}
				{renderCreateAssignmentModal()}
			</>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={collections}
			render={renderCollections}
		/>
	);
};
