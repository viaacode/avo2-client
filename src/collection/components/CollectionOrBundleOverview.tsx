import { QueryClient } from '@tanstack/react-query';
import {
	Button,
	ButtonToolbar,
	Icon,
	IconName,
	MetaData,
	MetaDataItem,
	MoreOptionsDropdown,
	Pagination,
	Spacer,
	Table,
	TableColumn,
	Thumbnail,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@viaa/avo2-components';
import { TableColumnSchema } from '@viaa/avo2-components/dist/esm/components/Table/Table';
import { PermissionName } from '@viaa/avo2-types';
import type { Avo } from '@viaa/avo2-types';
import { cloneDeep, compact, fromPairs, get, isNil, noop } from 'lodash-es';
import React, { FunctionComponent, ReactText, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrayParam, NumberParam, StringParam, useQueryParams } from 'use-query-params';

import { AssignmentService } from '../../assignment/assignment.service';
import CreateAssignmentModal from '../../assignment/modals/CreateAssignmentModal';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { BUNDLE_PATH } from '../../bundle/bundle.const';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';
import {
	CheckboxDropdownModal,
	CheckboxOption,
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../shared/components';
import QuickLaneModal from '../../shared/components/QuickLaneModal/QuickLaneModal';
import { getMoreOptionsLabel } from '../../shared/constants';
import {
	Lookup_Enum_Assignment_Content_Labels_Enum,
	useDeleteCollectionOrBundleByUuidMutation,
} from '../../shared/generated/graphql-db-types';
import {
	buildLink,
	createDropdownMenuItem,
	formatDate,
	formatTimestamp,
	isMobileWidth,
	navigate,
} from '../../shared/helpers';
import { truncateTableValue } from '../../shared/helpers/truncate';
import useTranslation from '../../shared/hooks/useTranslation';
import { COLLECTION_QUERY_KEYS } from '../../shared/services/data-service';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { ITEMS_PER_PAGE } from '../../workspace/workspace.const';
import { CollectionService } from '../collection.service';
import { Collection, CollectionShareType, ContentTypeNumber } from '../collection.types';

import DeleteCollectionModal from './modals/DeleteCollectionModal';

import './CollectionOrBundleOverview.scss';

interface CollectionOrBundleOverviewProps extends DefaultSecureRouteProps {
	numberOfItems: number;
	type: 'collection' | 'bundle';
	onUpdate: () => void | Promise<void>;
}

const CollectionOrBundleOverview: FunctionComponent<CollectionOrBundleOverviewProps> = ({
	numberOfItems,
	type,
	onUpdate = noop,
	history,
	user,
}) => {
	const { tText, tHtml } = useTranslation();

	// State
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [collections, setCollections] = useState<Collection[] | null>(null);
	const [permissions, setPermissions] = useState<{
		[collectionUuid: string]: { canEdit?: boolean; canDelete?: boolean };
	}>({});
	const [showPublicState, setShowPublicState] = useState(false);

	const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({});
	const [isQuickLaneModalOpen, setIsQuickLaneModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] = useState<boolean>(false);
	const [selectedCollectionUuid, setSelectedCollectionUuid] = useState<string | null>(null);
	const [selectedDetail, setSelectedDetail] = useState<Avo.Collection.Collection | undefined>(
		undefined
	);
	const [sortColumn, setSortColumn] = useState<keyof Avo.Collection.Collection>('updated_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [page, setPage] = useState<number>(0);

	const [query, setQuery] = useQueryParams({
		selectedShareTypeLabelIds: ArrayParam,
		page: NumberParam,
		sort_column: StringParam,
		sort_order: StringParam,
	});

	// Mutations
	const { mutateAsync: triggerCollectionOrBundleDelete } =
		useDeleteCollectionOrBundleByUuidMutation();

	// Listeners
	const onClickDelete = (collectionUuid: string) => {
		setDropdownOpen({ [collectionUuid]: false });
		setSelectedCollectionUuid(collectionUuid);
		setIsDeleteModalOpen(true);
	};

	const isCollection = type === 'collection';

	const fetchCollections = useCallback(async () => {
		try {
			const collections =
				await CollectionService.fetchCollectionsByOwnerOrContributorProfileId(
					user,
					page * ITEMS_PER_PAGE,
					ITEMS_PER_PAGE,
					{ [sortColumn]: sortOrder },
					isCollection ? ContentTypeNumber.collection : ContentTypeNumber.bundle,
					undefined,
					query.selectedShareTypeLabelIds as string[]
				);

			// Check edit and delete permissions for every row, so we can show the correct dropdown list of operations
			let perms: boolean[][];

			if (isCollection) {
				perms = await Promise.all(
					(collections || []).map((collection: Collection) => {
						const editPermission = PermissionService.hasPermissions(
							[
								{
									name: PermissionName.EDIT_OWN_COLLECTIONS,
									obj: collection,
								},
								PermissionName.EDIT_ANY_COLLECTIONS,
							],
							user
						);
						const deletePermission = PermissionService.hasPermissions(
							[
								{
									name: PermissionName.DELETE_OWN_COLLECTIONS,
									obj: collection,
								},
								PermissionName.DELETE_ANY_COLLECTIONS,
							],
							user
						);
						return Promise.all([editPermission, deletePermission]);
					})
				);
			} else {
				// bundles
				perms = await Promise.all(
					collections.map((bundle: Collection) => {
						const editPermission = PermissionService.hasPermissions(
							[
								{
									name: PermissionName.EDIT_OWN_BUNDLES,
									obj: bundle,
								},
								PermissionName.EDIT_ANY_BUNDLES,
							],
							user
						);
						const deletePermission = PermissionService.hasPermissions(
							[
								{
									name: PermissionName.DELETE_OWN_BUNDLES,
									obj: bundle,
								},
								PermissionName.DELETE_ANY_BUNDLES,
							],
							user
						);
						return Promise.all([editPermission, deletePermission]);
					})
				);
			}
			setPermissions(
				fromPairs(
					perms.map((permsForCollection: boolean[], index: number) => [
						collections[index].id,
						{
							canEdit: permsForCollection[0],
							canDelete: permsForCollection[1],
						},
					])
				)
			);
			setCollections(collections);
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
	}, [user, page, sortColumn, sortOrder, isCollection, tText, query]);

	useEffect(() => {
		fetchCollections();
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
			user
		).then((showPublicState) => setShowPublicState(showPublicState));
	}, [setShowPublicState, isCollection, user]);

	useEffect(() => {
		if (collections) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [setLoadingInfo, collections]);

	useEffect(() => {
		if (selectedCollectionUuid) {
			CollectionService.fetchCollectionOrBundleById(
				selectedCollectionUuid,
				isCollection ? 'collection' : 'bundle'
			).then((res) => setSelectedDetail(res || undefined));
		} else {
			setSelectedDetail(undefined);
		}
	}, [selectedCollectionUuid, isCollection]);

	useEffect(() => {
		if (query.sort_column) {
			setSortColumn(query.sort_column as keyof Avo.Collection.Collection);
		}
		if (query.sort_order) {
			setSortOrder(query.sort_order as Avo.Search.OrderDirection);
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

	const onDeleteCollection = async () => {
		try {
			setIsDeleteModalOpen(false);
			if (!selectedCollectionUuid) {
				ToastService.danger(
					isCollection
						? tHtml(
								'collection/components/collection-or-bundle-overview___er-was-geen-collectie-geselecteerd-gelieve-opnieuw-te-proberen-na-het-herladen-van-de-pagina'
						  )
						: tHtml(
								'collection/components/collection-or-bundle-overview___er-was-geen-bundel-geselecteerd-gelieve-opnieuw-te-proberen-na-het-herladen-van-de-pagina'
						  )
				);
				return;
			}
			await triggerCollectionOrBundleDelete(
				{
					collectionOrBundleUuid: selectedCollectionUuid,
					collectionOrBundleUuidAsText: selectedCollectionUuid,
				},
				{
					onSuccess: async () => {
						const queryClient = new QueryClient();
						await queryClient.invalidateQueries(COLLECTION_QUERY_KEYS);
					},
				}
			);

			trackEvents(
				{
					object: String(selectedCollectionUuid),
					object_type: type,
					action: 'delete',
				},
				user
			);

			ToastService.success(
				isCollection
					? tHtml(
							'collection/components/collection-or-bundle-overview___collectie-is-verwijderd'
					  )
					: tHtml(
							'collection/components/collection-or-bundle-overview___bundel-is-verwijderd'
					  )
			);
			onUpdate();
			fetchCollections();
		} catch (err) {
			console.error(err);
			ToastService.danger(
				isCollection
					? tHtml(
							'collection/components/collection-or-bundle-overview___collectie-kon-niet-verwijderd-worden'
					  )
					: tHtml(
							'collection/components/collection-or-bundle-overview___bundel-kon-niet-verwijderd-worden'
					  )
			);
		}

		setSelectedCollectionUuid(null);
	};

	const onClickCreate = () =>
		history.push(
			buildLink(
				APP_PATH.SEARCH.route,
				{},
				isCollection
					? { filters: '{"type":["video","audio"]}' }
					: { filters: '{"type":["collectie"]}' }
			)
		);

	// TODO: Make shared function because also used in assignments
	const onClickColumn = (columnId: keyof Avo.Collection.Collection) => {
		if (sortColumn === columnId) {
			// Change column sort order
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			// Initial column sort order
			setSortColumn(columnId);
			setSortOrder('asc');
		}
	};

	const onCreateAssignmentFromCollection = async (withDescription: boolean): Promise<void> => {
		const collection = await CollectionService.fetchCollectionOrBundleById(
			selectedCollectionUuid as string,
			'collection'
		);
		if (collection) {
			const assignmentId = await AssignmentService.createAssignmentFromCollection(
				user,
				collection,
				withDescription
			);

			history.push(buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, { id: assignmentId }));
		}
	};

	// Render functions
	const getLinkProps = (id: string, title: string): { to: string; title: string } => ({
		title,
		to: buildLink(isCollection ? APP_PATH.COLLECTION_DETAIL.route : BUNDLE_PATH.BUNDLE_DETAIL, {
			id,
		}),
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
						label={get(collection, 'view_counts_aggregate.aggregate.sum.count') || '0'}
					/>
				</MetaData>
			</div>
		</div>
	);

	const renderActions = (collectionUuid: string) => {
		const ROW_DROPDOWN_ITEMS = [
			...(permissions[collectionUuid] && permissions[collectionUuid].canEdit
				? [
						createDropdownMenuItem(
							'edit',
							tText('collection/views/collection-overview___bewerk'),
							'edit2'
						),
				  ]
				: []),
			...(isCollection && PermissionService.hasPerm(user, PermissionName.CREATE_ASSIGNMENTS)
				? [
						createDropdownMenuItem(
							'createAssignment',
							tText('collection/views/collection-overview___maak-opdracht'),
							'clipboard'
						),
				  ]
				: []),
			...(isCollection && PermissionService.hasPerm(user, PermissionName.CREATE_QUICK_LANE)
				? [
						createDropdownMenuItem(
							'createQuickLane',
							tText('collection/views/collection-overview___delen-met-leerlingen'),
							'link-2'
						),
				  ]
				: []),
			...(permissions[collectionUuid] && permissions[collectionUuid].canDelete
				? [
						createDropdownMenuItem(
							'delete',
							tText('collection/views/collection-overview___verwijderen')
						),
				  ]
				: []),
		];

		// Listeners
		const onClickDropdownItem = (item: ReactText) => {
			setDropdownOpen({ [collectionUuid]: false });
			switch (item) {
				case 'edit':
					navigate(
						history,
						isCollection ? APP_PATH.COLLECTION_EDIT.route : BUNDLE_PATH.BUNDLE_EDIT,
						{ id: collectionUuid }
					);
					break;

				case 'createAssignment':
					setSelectedCollectionUuid(collectionUuid);
					setIsCreateAssignmentModalOpen(true);
					break;

				case 'createQuickLane':
					setSelectedCollectionUuid(collectionUuid);
					setIsQuickLaneModalOpen(true);
					break;

				case 'delete':
					onClickDelete(collectionUuid);
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
				<MoreOptionsDropdown
					isOpen={dropdownOpen[collectionUuid] || false}
					onOpen={() => setDropdownOpen({ [collectionUuid]: true })}
					onClose={() => setDropdownOpen({ [collectionUuid]: false })}
					label={getMoreOptionsLabel()}
					menuItems={ROW_DROPDOWN_ITEMS}
					onOptionClicked={onClickDropdownItem}
				/>

				{!isMobileWidth() && (
					<Button
						icon={IconName.chevronRight}
						onClick={() =>
							navigate(
								history,
								isCollection
									? APP_PATH.COLLECTION_DETAIL.route
									: BUNDLE_PATH.BUNDLE_DETAIL,
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
				)}
			</ButtonToolbar>
		);
	};

	const renderCell = (collection: Collection, colKey: string) => {
		const { id } = collection;

		const sharedWithNames = collection.contributors.map((contributor) => {
			const fullName = contributor.profile?.user?.full_name;
			const orgName = contributor.profile?.organisation?.name;

			if (contributor.profile?.organisation?.name) {
				return `${fullName} (${orgName}) `;
			} else {
				return `${fullName} `;
			}
		});

		const shareTypeTitle =
			collection.share_type &&
			{
				[CollectionShareType.GEDEELD_MET_MIJ]: tText(
					'collection/views/collection-overview___gedeeld-met-mij'
				),
				[CollectionShareType.GEDEELD_MET_ANDERE]: tText(
					'collection/views/collection-overview___gedeeld-met-anderen'
				),
				[CollectionShareType.NIET_GEDEELD]: tText(
					'collection/views/collection-overview___mijn-collectie'
				),
			}[collection.share_type];

		const shareTypeText =
			collection.share_type === CollectionShareType.GEDEELD_MET_MIJ
				? tText('collection/views/collection-overview___gedeeld-met-mij')
				: collection.share_type === CollectionShareType.GEDEELD_MET_ANDERE
				? tHtml('collection/views/collection-overview___gedeeld-met-count-anderen-names', {
						count: sharedWithNames.length,
						names: sharedWithNames,
				  })
				: tText('collection/views/collection-overview___mijn-collectie');

		const shareTypeIcon =
			collection.share_type === CollectionShareType.GEDEELD_MET_MIJ
				? IconName.userGroup
				: collection.share_type === CollectionShareType.GEDEELD_MET_ANDERE
				? IconName.userGroup2
				: IconName.user2;

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

			case 'actions':
				return renderActions(id);

			case 'created_at':
			case 'updated_at': {
				const cellData = collection[colKey as 'created_at' | 'updated_at'];
				return <span title={formatTimestamp(cellData)}>{formatDate(cellData)}</span>;
			}
			case 'share_type':
				return (
					<Tooltip position="top">
						<TooltipTrigger>
							<div
								className="m-collection-overview-shared"
								title={shareTypeTitle || ''}
							>
								<Icon name={shareTypeIcon} />
							</div>
						</TooltipTrigger>
						<TooltipContent>{shareTypeText}</TooltipContent>
					</Tooltip>
				);
			default:
				return null;
		}
	};

	const getColumns = (): TableColumn[] => {
		if (isMobileWidth()) {
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
					id: 'actions',
					tooltip: tText('collection/components/collection-or-bundle-overview___acties'),
					col: '1',
				},
			];
		}
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
			{
				id: 'share_type',
				label: tText('collection/collection___gedeeld'),
				sortable: true,
				dataType: TableColumnDataType.string,
			},
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
						} as TableColumnSchema,
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
				id: 'actions',
				tooltip: tText('collection/components/collection-or-bundle-overview___acties'),
				col: '1',
			},
		];
	};

	const renderPagination = () => (
		<Pagination
			pageCount={Math.ceil(numberOfItems / ITEMS_PER_PAGE)}
			currentPage={page}
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

	const renderTable = (collections: Collection[]) => (
		<>
			{renderHeader()}
			<Table
				columns={getColumns()}
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

	const renderDeleteModal = () => {
		if (isCollection) {
			return (
				<DeleteCollectionModal
					isOpen={isDeleteModalOpen}
					onClose={() => {
						setSelectedCollectionUuid(null);
						setIsDeleteModalOpen(false);
					}}
					deleteObjectCallback={onDeleteCollection}
				/>
			);
		}
		return (
			<DeleteObjectModal
				title={tText(
					'collection/components/collection-or-bundle-overview___verwijder-bundel'
				)}
				body={tText(
					'collection/views/collection-overview___bent-u-zeker-deze-actie-kan-niet-worden-ongedaan-gemaakt'
				)}
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setSelectedCollectionUuid(null);
					setIsDeleteModalOpen(false);
				}}
				confirmCallback={onDeleteCollection}
			/>
		);
	};

	const renderQuickLaneModal = () => {
		return (
			selectedDetail && (
				<QuickLaneModal
					modalTitle={tHtml(
						'collection/views/collection-overview___delen-met-leerlingen'
					)}
					isOpen={isQuickLaneModalOpen}
					content={selectedDetail}
					content_label={Lookup_Enum_Assignment_Content_Labels_Enum.Collectie}
					onClose={() => {
						setSelectedCollectionUuid(null);
						setIsQuickLaneModalOpen(false);
					}}
					onUpdate={() => fetchCollections()}
				/>
			)
		);
	};

	const renderCreateAssignmentModal = () => {
		return (
			<CreateAssignmentModal
				isOpen={isCreateAssignmentModalOpen}
				onClose={() => setIsCreateAssignmentModalOpen(false)}
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

	const renderCollections = () => (
		<>
			{collections && collections.length ? renderTable(collections) : renderEmptyFallback()}
			{!isNil(selectedCollectionUuid) && renderDeleteModal()}
			{renderQuickLaneModal()}
			{renderCreateAssignmentModal()}
		</>
	);

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={collections}
			render={renderCollections}
		/>
	);
};

export default CollectionOrBundleOverview;
