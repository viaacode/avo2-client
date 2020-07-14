import { compact, get, truncate, without } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import {
	Button,
	ButtonToolbar,
	Container,
	IconName,
	TagList,
	TagOption,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
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
	CheckboxOption,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import { buildLink, CustomError, formatDate } from '../../../shared/helpers';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import { ToastService } from '../../../shared/services';
import i18n from '../../../shared/translations/i18n';
import { ITEMS_PER_PAGE } from '../../content/content.const';
import FilterTable, {
	FilterableColumn,
	getFilters,
} from '../../shared/components/FilterTable/FilterTable';
import {
	getBooleanFilters,
	getMultiOptionFilters,
	getQueryFilter,
} from '../../shared/helpers/filters';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';
import { useUserGroups } from '../../user-groups/hooks';
import { COLLECTIONS_OR_BUNDLES_PATH } from '../collections-or-bundles.const';
import { CollectionsOrBundlesService } from '../collections-or-bundles.service';
import {
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
						profile: {
							author_user_group: { groups: { label: { _ilike: queryWordWildcard } } },
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
			andFilters.push(
				...getMultiOptionFilters(
					filters,
					['author_user_group'],
					['profile.profile_user_group.groups.id']
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
	}, [setLoadingInfo, collections]);

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
		},
		{
			id: 'author',
			label: i18n.t(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___auteur'
			),
			sortable: true,
		},
		{
			id: 'author_user_group',
			label: i18n.t('admin/collections-or-bundles/collections-or-bundles___auteur-rol'),
			sortable: true,
			filterType: 'CheckboxDropdownModal',
			filterProps: {
				options: userGroupOptions,
			},
		},
		{
			id: 'last_updated_by_profile',
			label: i18n.t(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___laatste-bewerkt-door'
			),
			sortable: true,
		},
		{
			id: 'created_at',
			label: i18n.t('admin/collections-or-bundles/collections-or-bundles___aangemaakt-op'),
			sortable: true,
			filterType: 'DateRangeDropdown',
			filterProps: {},
		},
		{
			id: 'updated_at',
			label: i18n.t('admin/collections-or-bundles/collections-or-bundles___aangepast-op'),
			sortable: true,
			filterType: 'DateRangeDropdown',
			filterProps: {},
		},
		{
			id: 'is_public',
			label: i18n.t('admin/collections-or-bundles/collections-or-bundles___publiek'),
			sortable: true,
			filterType: 'BooleanCheckboxDropdown',
		},
		{
			id: 'collection_labels',
			label: i18n.t(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___labels'
			),
			sortable: false,
			filterType: 'CheckboxDropdownModal',
			filterProps: {
				options: collectionLabelOptions,
			},
		},
		{
			id: 'views',
			tooltip: i18n.t('admin/collections-or-bundles/collections-or-bundles___bekeken'),
			icon: 'eye',
			sortable: true,
		},
		{
			id: 'bookmarks',
			tooltip: i18n.t(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___aantal-keer-opgenomen-in-een-bladwijzer'
			),
			icon: 'bookmark',
			sortable: true,
		},
		{
			id: 'copies',
			tooltip: i18n.t(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___aantal-keer-gekopieerd'
			),
			icon: 'copy',
			sortable: true,
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
					},
			  ]
			: []),
		{ id: 'actions', label: '' },
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
				const lastEditUser: Avo.User.User | undefined = get(
					rowData,
					'updated_by.usersByuserId'
				);
				return lastEditUser ? `${lastEditUser.first_name} ${lastEditUser.last_name}` : '-';

			case 'is_public':
				return rowData[columnId]
					? t('admin/collections-or-bundles/views/collections-or-bundles-overview___ja')
					: t('admin/collections-or-bundles/views/collections-or-bundles-overview___nee');

			case 'views':
				return get(rowData, 'view_counts_aggregate.aggregate.sum.count') || '0';

			case 'bookmarks':
				return get(rowData, 'collection_bookmarks_aggregate.aggregate.count') || '0';

			case 'copies':
				return get(rowData, 'copies.aggregate.count') || '0';

			case 'in_bundle':
				return get(rowData, 'in_bundle.aggregate.count') || '0';

			case 'in_assignment':
				return get(rowData, 'in_assignment.aggregate.count') || '0';

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
