import { compact, get, truncate, without } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import {
	Button,
	ButtonToolbar,
	Container,
	IconName,
	TagInfo,
	TagList,
	TagOption,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { getProfileId } from '../../../authentication/helpers/get-profile-id';
import { getUserGroupLabel } from '../../../authentication/helpers/get-profile-info';
import {
	PermissionName,
	PermissionService,
} from '../../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { CollectionService } from '../../../collection/collection.service';
import { ContentTypeNumber, QualityLabel } from '../../../collection/collection.types';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import {
	CheckboxDropdownModalProps,
	CheckboxOption,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import { buildLink, CustomError, formatDate, getFullName } from '../../../shared/helpers';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import { ToastService } from '../../../shared/services';
import i18n from '../../../shared/translations/i18n';
import { ITEMS_PER_PAGE } from '../../content/content.const';
import ChangeAuthorModal from '../../shared/components/ChangeAuthorModal/ChangeAuthorModal';
import ChangeLabelsModal, {
	AddOrRemove,
} from '../../shared/components/ChangeLabelsModal/ChangeLabelsModal';
import FilterTable, {
	FilterableColumn,
	getFilters,
} from '../../shared/components/FilterTable/FilterTable';
import {
	getBooleanFilters,
	getDateRangeFilters,
	getMultiOptionFilters,
	getQueryFilter,
} from '../../shared/helpers/filters';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';
import { PickerItem } from '../../shared/types';
import { useUserGroups } from '../../user-groups/hooks';
import { COLLECTIONS_OR_BUNDLES_PATH } from '../collections-or-bundles.const';
import { CollectionsOrBundlesService } from '../collections-or-bundles.service';
import {
	CollectionBulkAction,
	CollectionsOrBundlesOverviewTableCols,
	CollectionsOrBundlesTableState,
} from '../collections-or-bundles.types';

interface CollectionsOrBundlesOverviewProps extends DefaultSecureRouteProps {}

const CollectionsOrBundlesOverview: FunctionComponent<CollectionsOrBundlesOverviewProps> = ({
	history,
	location,
	user,
}) => {
	const [t] = useTranslation();

	const [collections, setCollections] = useState<Avo.Collection.Collection[] | null>(null);
	const [collectionCount, setCollectionCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<CollectionsOrBundlesTableState>>({});
	const [collectionLabels, setCollectionLabels] = useState<QualityLabel[]>([]);

	const [selectedRows, setSelectedRows] = useState<Partial<Avo.Collection.Collection>[] | null>();

	const [changeAuthorModalOpen, setChangeAuthorModalOpen] = useState<boolean>(false);

	const [changeLabelsModalOpen, setAddLabelModalOpen] = useState<boolean>(false);

	const [userGroups] = useUserGroups();

	// computed
	const isCollection = location.pathname === COLLECTIONS_OR_BUNDLES_PATH.COLLECTIONS_OVERVIEW;

	// methods
	const fetchCollectionsOrBundles = useCallback(async () => {
		const generateWhereObject = (filters: Partial<CollectionsOrBundlesTableState>) => {
			const andFilters: any[] = [];
			andFilters.push(
				...getQueryFilter(filters.query, (queryWordWildcard: string) => [
					{ title: { _ilike: queryWordWildcard } },
					{ description: { _ilike: queryWordWildcard } },
					{
						profile: {
							usersByuserId: { first_name: { _ilike: queryWordWildcard } },
						},
					},
					{
						profile: {
							usersByuserId: { last_name: { _ilike: queryWordWildcard } },
						},
					},
					{
						updated_by: {
							usersByuserId: { first_name: { _ilike: queryWordWildcard } },
						},
					},
					{
						updated_by: {
							usersByuserId: { last_name: { _ilike: queryWordWildcard } },
						},
					},
				])
			);
			andFilters.push(...getDateRangeFilters(filters, ['created_at', 'updated_at']));
			andFilters.push(
				...getMultiOptionFilters(
					filters,
					['author_user_group'],
					['profile.profile_user_groups.groups.id']
				)
			);
			if (filters.collection_labels && filters.collection_labels.length) {
				andFilters.push({
					_or: [
						...getMultiOptionFilters(
							{
								collection_labels: without(filters.collection_labels, 'NO_LABEL'),
							},
							['collection_labels'],
							['collection_labels.label']
						),
						...(filters.collection_labels.includes('NO_LABEL')
							? [{ _not: { collection_labels: {} } }]
							: []),
					],
				});
			}
			andFilters.push(...getBooleanFilters(filters, ['is_public']));
			andFilters.push({ is_deleted: { _eq: false } });

			// Only show published/unpublished collections/bundles based on permissions
			if (
				(isCollection &&
					!PermissionService.hasPerm(
						user,
						PermissionName.VIEW_ANY_PUBLISHED_COLLECTIONS
					)) ||
				(!isCollection &&
					!PermissionService.hasPerm(user, PermissionName.VIEW_ANY_PUBLISHED_BUNDLES))
			) {
				andFilters.push({ is_public: { _eq: false } });
			}
			if (
				(isCollection &&
					!PermissionService.hasPerm(
						user,
						PermissionName.VIEW_ANY_UNPUBLISHED_COLLECTIONS
					)) ||
				(!isCollection &&
					!PermissionService.hasPerm(user, PermissionName.VIEW_ANY_UNPUBLISHED_BUNDLES))
			) {
				andFilters.push({ is_public: { _eq: true } });
			}

			andFilters.push({
				type_id: {
					_eq: isCollection ? ContentTypeNumber.collection : ContentTypeNumber.bundle,
				},
			});
			return { _and: andFilters };
		};

		try {
			const [
				collectionsTemp,
				collectionsCountTemp,
			] = await CollectionsOrBundlesService.getCollections(
				tableState.page || 0,
				(tableState.sort_column || 'created_at') as CollectionsOrBundlesOverviewTableCols,
				tableState.sort_order || 'desc',
				generateWhereObject(getFilters(tableState))
			);
			setCollections(collectionsTemp);
			setCollectionCount(collectionsCountTemp);
		} catch (err) {
			console.error(
				new CustomError('Failed to get collections from the database', err, { tableState })
			);
			setLoadingInfo({
				state: 'error',
				message: isCollection
					? t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___het-ophalen-van-de-collecties-is-mislukt'
					  )
					: t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___het-ophalen-van-de-bundels-is-mislukt'
					  ),
			});
		}
	}, [setLoadingInfo, setCollections, setCollectionCount, tableState, isCollection, user, t]);

	const fetchCollectionLabels = useCallback(async () => {
		try {
			setCollectionLabels(await CollectionService.fetchQualityLabels());
		} catch (err) {
			console.error(new CustomError('Failed to get quality labels from the database', err));
			ToastService.danger(
				t(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___het-ophalen-van-de-labels-is-mislukt'
				)
			);
		}
	}, [setCollectionLabels, t]);

	useEffect(() => {
		fetchCollectionsOrBundles();
		fetchCollectionLabels();
	}, [fetchCollectionsOrBundles, fetchCollectionLabels]);

	useEffect(() => {
		if (collections) {
			setLoadingInfo({
				state: 'loaded',
			});
		}

		// Update selected rows to always be a subset of the collections array
		// In other words, you cannot have something selected that isn't part of the current filtered/paginated results
		const collectionIds: string[] = (collections || []).map(coll => coll.id);
		setSelectedRows(currentSelectedRows => {
			return (currentSelectedRows || []).filter(
				coll => coll.id && collectionIds.includes(coll.id)
			);
		});
	}, [setLoadingInfo, collections, setSelectedRows]);

	const userGroupOptions = userGroups.map(
		(option): CheckboxOption => ({
			id: String(option.id),
			label: option.label,
			checked: get(tableState, 'author.user_groups', [] as string[]).includes(
				String(option.id)
			),
		})
	);

	const collectionLabelOptions = [
		{
			id: 'NO_LABEL',
			label: t(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___geen-label'
			),
			checked: get(tableState, 'collection_labels', [] as string[]).includes('NO_LABEL'),
		},
		...collectionLabels.map(
			(option): CheckboxOption => ({
				id: String(option.value),
				label: option.description,
				checked: get(tableState, 'collection_labels', [] as string[]).includes(
					String(option.value)
				),
			})
		),
	];

	const getUserOverviewTableCols = (): FilterableColumn[] => [
		{
			id: 'title',
			label: i18n.t('admin/collections-or-bundles/collections-or-bundles___title'),
			sortable: true,
			visibleByDefault: true,
		},
		{
			id: 'author',
			label: i18n.t(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___auteur'
			),
			sortable: true,
			visibleByDefault: true,
		},
		{
			id: 'author_user_group',
			label: i18n.t('admin/collections-or-bundles/collections-or-bundles___auteur-rol'),
			// Waiting for https://meemoo.atlassian.net/browse/DEV-1070
			// sortable: true,
			visibleByDefault: true,
			filterType: 'CheckboxDropdownModal',
			filterProps: {
				options: userGroupOptions,
			} as CheckboxDropdownModalProps,
		},
		{
			id: 'last_updated_by_profile',
			label: i18n.t(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___laatste-bewerkt-door'
			),
			sortable: true,
			visibleByDefault: true,
		},
		{
			id: 'created_at',
			label: i18n.t('admin/collections-or-bundles/collections-or-bundles___aangemaakt-op'),
			sortable: true,
			visibleByDefault: true,
			filterType: 'DateRangeDropdown',
			filterProps: {},
		},
		{
			id: 'updated_at',
			label: i18n.t('admin/collections-or-bundles/collections-or-bundles___aangepast-op'),
			sortable: true,
			visibleByDefault: true,
			filterType: 'DateRangeDropdown',
			filterProps: {},
		},
		{
			id: 'is_public',
			label: i18n.t('admin/collections-or-bundles/collections-or-bundles___publiek'),
			sortable: true,
			visibleByDefault: true,
			filterType: 'BooleanCheckboxDropdown',
		},
		{
			id: 'collection_labels',
			label: i18n.t(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___labels'
			),
			sortable: false,
			visibleByDefault: true,
			filterType: 'CheckboxDropdownModal',
			filterProps: {
				options: collectionLabelOptions,
			} as CheckboxDropdownModalProps,
		},
		{
			id: 'views',
			tooltip: i18n.t('admin/collections-or-bundles/collections-or-bundles___bekeken'),
			icon: 'eye',
			sortable: true,
			visibleByDefault: true,
		},
		{
			id: 'bookmarks',
			tooltip: i18n.t(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___aantal-keer-opgenomen-in-een-bladwijzer'
			),
			icon: 'bookmark',
			sortable: true,
			visibleByDefault: true,
		},
		{
			id: 'copies',
			tooltip: i18n.t(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___aantal-keer-gekopieerd'
			),
			icon: 'copy',
			sortable: true,
			visibleByDefault: true,
		},
		...(isCollection
			? [
					{
						id: 'in_bundle',
						tooltip: i18n.t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___aantal-keer-opgenomen-in-een-bundel'
						),
						icon: 'folder' as IconName,
						sortable: true,
						visibleByDefault: true,
					},
			  ]
			: []),
		...(isCollection
			? [
					{
						id: 'in_assignment',
						tooltip: i18n.t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___aantal-keer-opgenomen-in-een-opdracht'
						),
						icon: 'clipboard' as IconName,
						sortable: true,
						visibleByDefault: true,
					},
			  ]
			: []),
		{
			id: 'actions',
			tooltip: t(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___acties'
			),
			visibleByDefault: true,
		},
	];

	const navigateToCollectionDetail = (id: string | undefined) => {
		if (!id) {
			ToastService.danger(
				isCollection
					? t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___deze-collectie-heeft-geen-geldig-id'
					  )
					: t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___deze-bundel-heeft-geen-geldig-id'
					  ),
				false
			);
			return;
		}
		const detailRoute = isCollection
			? APP_PATH.COLLECTION_DETAIL.route
			: APP_PATH.BUNDLE_DETAIL.route;
		const link = buildLink(detailRoute, { id });
		redirectToClientPage(link, history);
	};

	const handleBulkActionSelect = async (action: CollectionBulkAction): Promise<void> => {
		if (!selectedRows || !selectedRows.length) {
			return;
		}
		switch (action) {
			case 'publish':
				await bulkChangePublishStateForSelectedCollections(true);
				return;

			case 'depublish':
				await bulkChangePublishStateForSelectedCollections(false);
				return;

			case 'delete':
				await bulkDeleteSelectedCollections();
				return;

			case 'change_author':
				setChangeAuthorModalOpen(true);
				return;

			case 'change_labels':
				setAddLabelModalOpen(true);
				return;
		}
	};

	const bulkChangePublishStateForSelectedCollections = async (isPublic: boolean) => {
		try {
			if (!selectedRows || !selectedRows.length) {
				return;
			}
			await CollectionsOrBundlesService.bulkChangePublicStateForCollections(
				isPublic,
				compact(selectedRows.map(collection => collection.id)),
				getProfileId(user)
			);
			ToastService.success(
				isPublic
					? t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___de-gegeselecterde-collecties-zijn-gepubliceerd'
					  )
					: t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___de-gegeselecterde-collecties-zijn-gedepubliceerd'
					  ),
				false
			);
			fetchCollectionsOrBundles();
		} catch (err) {
			console.error(
				new CustomError('Failed to toggle publish state for collections', err, {
					selectedRows,
					isPublic,
				})
			);
			ToastService.danger(
				isPublic
					? t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___het-publiceren-van-de-collecties-is-mislukt'
					  )
					: t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___het-depubliceren-van-de-collecties-is-mislukt'
					  ),
				false
			);
		}
	};

	const bulkDeleteSelectedCollections = async () => {
		try {
			if (!selectedRows || !selectedRows.length) {
				return;
			}
			await CollectionsOrBundlesService.bulkDeleteCollections(
				compact(selectedRows.map(collection => collection.id)),
				getProfileId(user)
			);
			ToastService.success(
				t(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___de-gegeselecterde-collecties-zijn-verwijderd'
				),
				false
			);
			fetchCollectionsOrBundles();
		} catch (err) {
			console.error(
				new CustomError('Failed to bulk delete collections', err, {
					selectedRows,
				})
			);
			ToastService.danger(
				t(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___het-verwijderen-van-de-collecties-is-mislukt'
				),
				false
			);
		}
	};

	const bulkChangeAuthor = async (authorProfileId: string) => {
		try {
			if (!selectedRows || !selectedRows.length) {
				return;
			}
			await CollectionsOrBundlesService.bulkUpdateAuthorForCollections(
				authorProfileId,
				compact(selectedRows.map(collection => collection.id)),
				getProfileId(user)
			);
			ToastService.success(
				t(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___de-auteurs-zijn-aangepast-voor-de-geselecterde-collecties'
				),
				false
			);
			fetchCollectionsOrBundles();
		} catch (err) {
			console.error(
				new CustomError('Failed to bulk update author for collections', err, {
					authorProfileId,
				})
			);
			ToastService.danger(
				t(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___het-aanpassen-van-de-auteurs-is-mislukt'
				),
				false
			);
		}
	};

	const bulkChangeLabels = async (addOrRemove: AddOrRemove, labels: string[]) => {
		try {
			if (!selectedRows || !selectedRows.length) {
				return;
			}
			if (addOrRemove === 'add') {
				await CollectionsOrBundlesService.bulkAddLabelsToCollections(
					labels,
					compact(selectedRows.map(collection => collection.id)),
					getProfileId(user)
				);
				ToastService.success(
					t(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___de-labels-zijn-toegevoegd-aan-de-geslecteerde-collecties'
					),
					false
				);
			} else {
				// remove
				await CollectionsOrBundlesService.bulkRemoveLabelsFromCollections(
					labels,
					compact(selectedRows.map(collection => collection.id)),
					getProfileId(user)
				);
				ToastService.success(
					t(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___de-labels-zijn-verwijderd-van-de-geslecteerde-collecties'
					),
					false
				);
			}
			fetchCollectionsOrBundles();
		} catch (err) {
			console.error(
				new CustomError('Failed to bulk update labels of collections', err, {
					addOrRemove,
					labels,
				})
			);
			ToastService.danger(
				t(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___het-aanpassen-van-de-labels-is-mislukt'
				),
				false
			);
		}
	};

	const navigateToCollectionEdit = (id: string | undefined) => {
		if (!id) {
			ToastService.danger(
				isCollection
					? t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___deze-collectie-heeft-geen-geldig-id'
					  )
					: t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___deze-bundel-heeft-geen-geldig-id'
					  ),
				false
			);
			return;
		}
		const detailRoute = isCollection
			? APP_PATH.COLLECTION_EDIT.route
			: APP_PATH.BUNDLE_EDIT.route;
		const link = buildLink(detailRoute, { id });
		redirectToClientPage(link, history);
	};

	const renderTableCell = (
		rowData: Partial<Avo.Collection.Collection>,
		columnId: CollectionsOrBundlesOverviewTableCols
	) => {
		switch (columnId) {
			case 'author':
				const user: Avo.User.User | undefined = get(rowData, 'profile.user');
				return user ? truncateTableValue(`${user.first_name} ${user.last_name}`) : '-';

			case 'author_user_group':
				return getUserGroupLabel(get(rowData, 'profile')) || '-';

			case 'last_updated_by_profile':
				const lastEditUser: Avo.User.User | undefined = get(rowData, 'updated_by.user');
				return lastEditUser ? `${lastEditUser.first_name} ${lastEditUser.last_name}` : '-';

			case 'is_public':
				return rowData[columnId]
					? t('admin/collections-or-bundles/views/collections-or-bundles-overview___ja')
					: t('admin/collections-or-bundles/views/collections-or-bundles-overview___nee');

			case 'views':
				return get(rowData, 'counts.views') || '0';

			case 'bookmarks':
				return get(rowData, 'counts.bookmarks') || '0';

			case 'copies':
				return get(rowData, 'relations_aggregate.aggregate.count') || '0';

			case 'in_bundle':
				return get(rowData, 'counts.in_collection') || '0';

			case 'in_assignment':
				return get(rowData, 'counts.in_assignment') || '0';

			case 'created_at':
			case 'updated_at':
				return formatDate(rowData[columnId]) || '-';

			case 'collection_labels':
				const labels: { id: number; label: string }[] =
					get(rowData, 'collection_labels') || [];
				const tags: TagOption[] = compact(
					labels.map((labelObj: any): TagOption | null => {
						const prettyLabel = collectionLabels.find(
							collectionLabel => collectionLabel.value === labelObj.label
						);
						if (!prettyLabel) {
							return null;
						}
						return { label: prettyLabel.description, id: labelObj.id };
					})
				);
				if (tags.length) {
					return <TagList tags={tags} swatches={false} />;
				}

				return '-';

			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							type="secondary"
							icon="eye"
							onClick={() => navigateToCollectionDetail(rowData.id)}
							ariaLabel={
								isCollection
									? t(
											'admin/collections-or-bundles/views/collections-or-bundles-overview___bekijk-de-collectie'
									  )
									: t(
											'admin/collections-or-bundles/views/collections-or-bundles-overview___bekijk-de-bundel'
									  )
							}
							title={
								isCollection
									? t(
											'admin/collections-or-bundles/views/collections-or-bundles-overview___bekijk-de-collectie'
									  )
									: t(
											'admin/collections-or-bundles/views/collections-or-bundles-overview___bekijk-de-bundel'
									  )
							}
						/>
						<Button
							type="secondary"
							icon="edit"
							onClick={() => navigateToCollectionEdit(rowData.id)}
							ariaLabel={
								isCollection
									? t(
											'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-collectie'
									  )
									: t(
											'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-bundel'
									  )
							}
							title={
								isCollection
									? t(
											'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-collectie'
									  )
									: t(
											'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-bundel'
									  )
							}
						/>
					</ButtonToolbar>
				);

			default:
				return truncate((rowData as any)[columnId] || '-', { length: 50 });
		}
	};

	const renderNoResults = () => {
		return (
			<ErrorView
				message={t(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___er-bestaan-nog-geen-collecties'
				)}
			>
				<p>
					<Trans i18nKey="admin/collections-or-bundles/views/collections-or-bundles-overview___beschrijving-wanneer-er-nog-geen-collecties-zijn">
						Beschrijving wanneer er nog geen collecties zijn
					</Trans>
				</p>
			</ErrorView>
		);
	};

	const renderCollectionsOrBundlesOverview = () => {
		if (!collections) {
			return null;
		}
		return (
			<>
				<FilterTable
					columns={getUserOverviewTableCols()}
					data={collections}
					dataCount={collectionCount}
					renderCell={renderTableCell as any}
					searchTextPlaceholder={t(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___zoek-op-titel-auteur-rol'
					)}
					noContentMatchingFiltersMessage={
						isCollection
							? t(
									'admin/collections-or-bundles/views/collections-or-bundles-overview___er-zijn-geen-collecties-doe-voldoen-aan-de-opgegeven-filters'
							  )
							: t(
									'admin/collections-or-bundles/views/collections-or-bundles-overview___er-zijn-geen-bundels-doe-voldoen-aan-de-opgegeven-filters'
							  )
					}
					itemsPerPage={ITEMS_PER_PAGE}
					onTableStateChanged={setTableState}
					renderNoResults={renderNoResults}
					rowKey={'id'}
					bulkActions={[
						{
							label: t(
								'admin/collections-or-bundles/views/collections-or-bundles-overview___publiceren'
							),
							value: 'publish',
							confirm: true,
							confirmButtonType: 'primary',
						},
						{
							label: t(
								'admin/collections-or-bundles/views/collections-or-bundles-overview___depubliceren'
							),
							value: 'depublish',
							confirm: true,
							confirmButtonType: 'danger',
						},
						{
							label: t(
								'admin/collections-or-bundles/views/collections-or-bundles-overview___verwijderen'
							),
							value: 'delete',
							confirm: true,
							confirmButtonType: 'danger',
						},
						{
							label: t(
								'admin/collections-or-bundles/views/collections-or-bundles-overview___auteur-aanpassen'
							),
							value: 'change_author',
						},
						{
							label: t(
								'admin/collections-or-bundles/views/collections-or-bundles-overview___labels-aanpassen'
							),
							value: 'change_labels',
						},
					]}
					onSelectBulkAction={handleBulkActionSelect as any}
					selectedItems={selectedRows}
					onSelectionChanged={setSelectedRows}
				/>
				<ChangeAuthorModal
					isOpen={changeAuthorModalOpen}
					onClose={() => setChangeAuthorModalOpen(false)}
					callback={(newAuthor: PickerItem) => bulkChangeAuthor(newAuthor.value)}
					initialAuthor={{
						label: getFullName(user as { profile: Avo.User.Profile }) as string,
						value: getProfileId(user),
						type: 'PROFILE',
					}}
				/>
				<ChangeLabelsModal
					isOpen={changeLabelsModalOpen}
					onClose={() => setAddLabelModalOpen(false)}
					labels={collectionLabels.map(labelObj => ({
						label: labelObj.description,
						value: labelObj.value,
					}))}
					callback={(addOrRemove: AddOrRemove, labels: TagInfo[]) =>
						bulkChangeLabels(
							addOrRemove,
							labels.map(labelObj => labelObj.value.toString())
						)
					}
				/>
			</>
		);
	};

	return (
		<AdminLayout
			pageTitle={
				isCollection
					? t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___collecties'
					  )
					: t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___bundels'
					  )
			}
		>
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							isCollection
								? t(
										'admin/collections-or-bundles/views/collections-or-bundles-overview___collectie-beheer-overview-pagina-titel'
								  )
								: t(
										'admin/collections-or-bundles/views/collections-or-bundles-overview___bundel-beheer-overview-pagina-titel'
								  )
						)}
					</title>
					<meta
						name="description"
						content={
							isCollection
								? t(
										'admin/collections-or-bundles/views/collections-or-bundles-overview___collectie-beheer-overview-pagina-beschrijving'
								  )
								: t(
										'admin/collections-or-bundles/views/collections-or-bundles-overview___bundel-beheer-overview-pagina-beschrijving'
								  )
						}
					/>
				</MetaTags>
				<Container mode="vertical" size="small">
					<Container mode="horizontal" size="full-width">
						<LoadingErrorLoadedComponent
							loadingInfo={loadingInfo}
							dataObject={collections}
							render={renderCollectionsOrBundlesOverview}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default CollectionsOrBundlesOverview;
