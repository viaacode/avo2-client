import { Button, ButtonToolbar, IconName } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, {
	type FunctionComponent,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { CollectionCreateUpdateTab } from '../../../collection/collection.types';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import {
	type CheckboxOption,
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../../shared/components';
import { CollectionOrBundleOrAssignmentTitleAndCopyTag } from '../../../shared/components/CollectionOrBundleOrAssignmentTitleAndCopyTag/CollectionOrBundleOrAssignmentTitleAndCopyTag';
import { buildLink, CustomError } from '../../../shared/helpers';
import { useCompaniesWithUsers } from '../../../shared/hooks/useCompanies';
import { useLomEducationLevels } from '../../../shared/hooks/useLomEducationLevels';
import { useLomSubjects } from '../../../shared/hooks/useLomSubjects';
import { useQualityLabels } from '../../../shared/hooks/useQualityLabels';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { TableColumnDataType } from '../../../shared/types/table-column-data-type';
import FilterTable, {
	type FilterableColumn,
	getFilters,
} from '../../shared/components/FilterTable/FilterTable';
import { NULL_FILTER } from '../../shared/helpers/filters';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';
import { useUserGroups } from '../../user-groups/hooks/useUserGroups';
import {
	COLLECTIONS_OR_BUNDLES_PATH,
	GET_COLLECTION_ACTUALISATION_COLUMNS,
	ITEMS_PER_PAGE,
} from '../collections-or-bundles.const';
import { CollectionsOrBundlesService } from '../collections-or-bundles.service';
import {
	type CollectionOrBundleActualisationOverviewTableCols,
	type CollectionOrBundleActualisationTableState,
} from '../collections-or-bundles.types';
import { generateCollectionWhereObject } from '../helpers/collection-filters';
import { renderCollectionOverviewColumns } from '../helpers/render-collection-columns';

type CollectionOrBundleActualisationOverviewProps = DefaultSecureRouteProps;

const CollectionOrBundleActualisationOverview: FunctionComponent<
	CollectionOrBundleActualisationOverviewProps
> = ({ location, user }) => {
	const { tText, tHtml } = useTranslation();

	const [collections, setCollections] = useState<Avo.Collection.Collection[] | null>(null);
	const [collectionCount, setCollectionCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<
		Partial<CollectionOrBundleActualisationTableState>
	>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);

	const [userGroups] = useUserGroups(false);
	const [subjects] = useLomSubjects();
	const [educationLevels] = useLomEducationLevels();
	const [collectionLabels] = useQualityLabels(true);
	const [organisations] = useCompaniesWithUsers();

	// computed

	const userGroupOptions = useMemo(() => {
		return [
			...userGroups.map(
				(option): CheckboxOption => ({
					id: String(option.id),
					label: option.label as string,
					checked: (tableState?.author_user_group || ([] as string[])).includes(
						String(option.id)
					),
				})
			),
			{
				id: NULL_FILTER,
				label: tText('admin/collections-or-bundles/views/collection-or-bundle___geen-rol'),
				checked: ((tableState?.author_user_group || []) as string[]).includes(NULL_FILTER),
			},
		];
	}, [tableState, userGroups, tText]);

	const collectionLabelOptions = useMemo(
		() => [
			{
				id: NULL_FILTER,
				label: tText(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___geen-label'
				),
				checked: ((tableState?.collection_labels || []) as string[]).includes(NULL_FILTER),
			},
			...collectionLabels.map(
				(option): CheckboxOption => ({
					id: String(option.value),
					label: option.description,
					checked: ((tableState?.collection_labels || []) as string[]).includes(
						String(option.value)
					),
				})
			),
		],
		[collectionLabels, tText, tableState]
	);

	const organisationOptions = useMemo(
		() => [
			{
				id: NULL_FILTER,
				label: tText(
					'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___geen-organisatie'
				),
				checked: ((tableState?.organisation || []) as string[]).includes(NULL_FILTER),
			},
			...organisations.map(
				(option): CheckboxOption => ({
					id: String(option.or_id),
					label: option.name,
					checked: ((tableState?.organisation || []) as string[]).includes(
						String(option.or_id)
					),
				})
			),
		],
		[organisations, tText, tableState]
	);

	const tableColumns = useMemo(
		() =>
			GET_COLLECTION_ACTUALISATION_COLUMNS(
				userGroupOptions,
				collectionLabelOptions,
				subjects,
				educationLevels,
				organisationOptions
			),
		[collectionLabelOptions, educationLevels, subjects, userGroupOptions, organisationOptions]
	);

	const isCollection =
		location.pathname === COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_ACTUALISATION_OVERVIEW;

	// methods
	const generateWhereObject = useCallback(
		(filters: Partial<CollectionOrBundleActualisationTableState>) => {
			const andFilters: any[] = generateCollectionWhereObject(
				filters,
				user,
				isCollection,
				true,
				false,
				'view'
			);

			return { _and: andFilters };
		},
		[isCollection, user]
	);

	const fetchCollectionsOrBundles = useCallback(async () => {
		setIsLoading(true);

		try {
			const column = tableColumns.find(
				(tableColumn: FilterableColumn) => tableColumn.id || '' === tableState.sort_column
			);
			const columnDataType = (column?.dataType ||
				TableColumnDataType.string) as TableColumnDataType;
			const [collectionsTemp, collectionsCountTemp] =
				await CollectionsOrBundlesService.getCollectionEditorial(
					tableState.page || 0,
					(tableState.sort_column ||
						'created_at') as CollectionOrBundleActualisationOverviewTableCols,
					tableState.sort_order || 'desc',
					columnDataType,
					generateWhereObject(getFilters(tableState)),
					'actualisation'
				);
			setCollections(collectionsTemp);
			setCollectionCount(collectionsCountTemp);
		} catch (err) {
			console.error(
				new CustomError('Failed to get collection actualisations from the database', err, {
					tableState,
				})
			);
			setLoadingInfo({
				state: 'error',
				message: isCollection
					? tText(
							'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___het-ophalen-van-de-collectie-actualisaties-is-mislukt'
					  )
					: tText(
							'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___het-ophalen-van-de-bundel-actualisaties-is-mislukt'
					  ),
			});
		}
		setIsLoading(false);
	}, [tableColumns, tableState, generateWhereObject, isCollection, tText]);

	useEffect(() => {
		fetchCollectionsOrBundles();
	}, [fetchCollectionsOrBundles]);

	useEffect(() => {
		if (collections) {
			setLoadingInfo({
				state: 'loaded',
			});
		}

		// Update selected rows to always be a subset of the collections array
		// In other words, you cannot have something selected that isn't part of the current filtered/paginated results
		const collectionIds: string[] = (collections || []).map((coll) => coll.id);
		setSelectedCollectionIds((currentSelectedCollectionIds) => {
			return (currentSelectedCollectionIds || []).filter(
				(collId) => collId && collectionIds.includes(collId)
			);
		});
	}, [setLoadingInfo, collections, setSelectedCollectionIds]);

	const setAllCollectionsAsSelected = async () => {
		setIsLoading(true);
		try {
			const collectionIds = await CollectionsOrBundlesService.getCollectionIds(
				generateWhereObject(getFilters(tableState))
			);
			ToastService.info(
				tHtml(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___je-hebt-num-of-selected-collections-collecties-geselecteerd',
					{
						numOfSelectedCollections: collectionIds.length,
					}
				)
			);
			setSelectedCollectionIds(collectionIds);
		} catch (err) {
			console.error(
				new CustomError(
					'Failed to get all collection ids that match the selected filter',
					err,
					{ tableState }
				)
			);
			ToastService.danger(
				tHtml(
					'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___het-ophalen-van-de-collectie-ids-is-mislukt'
				)
			);
		}
		setIsLoading(false);
	};

	const renderTableCell = (
		collectionOrBundle: Partial<Avo.Collection.Collection>,
		columnId: CollectionOrBundleActualisationOverviewTableCols
	) => {
		const editLink = buildLink(
			isCollection ? APP_PATH.COLLECTION_EDIT_TAB.route : APP_PATH.BUNDLE_EDIT_TAB.route,
			{ id: collectionOrBundle.id, tabId: CollectionCreateUpdateTab.ACTUALISATION }
		);
		const editLinkOriginal = collectionOrBundle.relations?.[0].object
			? buildLink(
					isCollection
						? APP_PATH.COLLECTION_EDIT_TAB.route
						: APP_PATH.BUNDLE_EDIT_TAB.route,
					{
						id: collectionOrBundle.relations?.[0].object,
						tabId: CollectionCreateUpdateTab.ACTUALISATION,
					}
			  )
			: null;

		switch (columnId) {
			case 'title': {
				return (
					<CollectionOrBundleOrAssignmentTitleAndCopyTag
						title={collectionOrBundle.title}
						editLink={editLink}
						editLinkOriginal={editLinkOriginal}
					/>
				);
			}

			case 'actions':
				return (
					<ButtonToolbar>
						<Link to={editLink}>
							<Button
								type="secondary"
								icon={IconName.edit}
								ariaLabel={
									isCollection
										? tText(
												'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-collectie'
										  )
										: tText(
												'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-bundel'
										  )
								}
								title={
									isCollection
										? tText(
												'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-collectie'
										  )
										: tText(
												'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-bundel'
										  )
								}
							/>
						</Link>
					</ButtonToolbar>
				);

			default:
				return renderCollectionOverviewColumns(
					collectionOrBundle,
					columnId,
					collectionLabels
				);
		}
	};

	const renderNoResults = () => {
		return (
			<ErrorView
				message={tHtml(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___er-bestaan-nog-geen-collecties'
				)}
			>
				<p>
					{tHtml(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___beschrijving-wanneer-er-nog-geen-collecties-zijn'
					)}
				</p>
			</ErrorView>
		);
	};

	const renderCollectionOrBundleActualisationOverview = () => {
		if (!collections) {
			return null;
		}
		return (
			<>
				<FilterTable
					columns={tableColumns}
					data={collections}
					dataCount={collectionCount}
					renderCell={renderTableCell as any}
					searchTextPlaceholder={tText(
						'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___zoek-op-titel-beschrijving-auteur'
					)}
					noContentMatchingFiltersMessage={
						isCollection
							? tText(
									'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___er-zijn-geen-collectie-actualisaties-die-voldoen-aan-de-opgegeven-filters'
							  )
							: tText(
									'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___er-zijn-geen-bundel-actualisaties-die-voldoen-aan-de-opgegeven-filters'
							  )
					}
					itemsPerPage={ITEMS_PER_PAGE}
					onTableStateChanged={setTableState}
					renderNoResults={renderNoResults}
					rowKey="id"
					selectedItemIds={selectedCollectionIds}
					onSelectionChanged={setSelectedCollectionIds as (ids: ReactNode[]) => void}
					onSelectAll={setAllCollectionsAsSelected}
					isLoading={isLoading}
				/>
			</>
		);
	};

	return (
		<AdminLayout
			pageTitle={
				isCollection
					? tText(
							'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___collecties-actualisatie'
					  )
					: tText(
							'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___bundels-actualisatie'
					  )
			}
			size="full-width"
		>
			<AdminLayoutBody>
				<Helmet>
					<title>
						{GENERATE_SITE_TITLE(
							isCollection
								? tText(
										'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___collectie-actualisation-beheer-overview-pagina-titel'
								  )
								: tText(
										'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___bundel-actualisation-beheer-overview-pagina-titel'
								  )
						)}
					</title>
					<meta
						name="description"
						content={
							isCollection
								? tText(
										'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___collectie-actualisation-beheer-overview-pagina-beschrijving'
								  )
								: tText(
										'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___bundel-actualisation-beheer-overview-pagina-beschrijving'
								  )
						}
					/>
				</Helmet>
				<LoadingErrorLoadedComponent
					loadingInfo={loadingInfo}
					dataObject={collections}
					render={renderCollectionOrBundleActualisationOverview}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default CollectionOrBundleActualisationOverview;
