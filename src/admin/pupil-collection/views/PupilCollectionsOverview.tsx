import {
	ExportAllToCsvModal,
	type FilterableColumn,
	FilterTable,
	getFilters,
} from '@meemoo/admin-core-ui/admin';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { useAtomValue } from 'jotai';
import { get, isNil } from 'lodash-es';
import React, { type FC, type ReactText, useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';

import { AssignmentService } from '../../../assignment/assignment.service';
import { commonUserAtom } from '../../../authentication/authentication.store';
import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views/ErrorView';
import { PupilCollectionService } from '../../../pupil-collection/pupil-collection.service';
import { type PupilCollectionOverviewTableColumns } from '../../../pupil-collection/pupil-collection.types';
import { OrderDirection } from '../../../search/search.const';
import { ConfirmModal } from '../../../shared/components/ConfirmModal/ConfirmModal';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { CustomError } from '../../../shared/helpers/custom-error';
import { tableColumnListToCsvColumnList } from '../../../shared/helpers/table-column-list-to-csv-column-list';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { TableColumnDataType } from '../../../shared/types/table-column-data-type';
import { AssignmentsBulkAction } from '../../assignments/assignments.types';
import { ChangeAuthorModal } from '../../shared/components/ChangeAuthorModal/ChangeAuthorModal';
import { getDateRangeFilters, getMultiOptionFilters } from '../../shared/helpers/filters';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import { AdminLayoutBody } from '../../shared/layouts/AdminLayout/AdminLayout.slots';
import { type PickerItem } from '../../shared/types';
import {
	renderPupilCollectionTableCellReact,
	renderPupilCollectionTableCellText,
} from '../helpers/render-pupil-collections-overview-table-cell';
import {
	GET_PUPIL_COLLECTION_BULK_ACTIONS,
	GET_PUPIL_COLLECTIONS_OVERVIEW_TABLE_COLS,
	ITEMS_PER_PAGE,
} from '../pupil-collection.const';
import { type PupilCollectionsOverviewTableState } from '../pupil-collection.types';

export const PupilCollectionsOverview: FC = () => {
	const { tText, tHtml } = useTranslation();
	const commonUser = useAtomValue(commonUserAtom);

	const [pupilCollections, setPupilCollections] = useState<Avo.Assignment.Response[] | null>(
		null
	);
	const [pupilCollectionsCount, setPupilCollectionsCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<PupilCollectionsOverviewTableState>>({
		sort_column: 'created_at',
		sort_order: OrderDirection.desc,
	});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isExportAllToCsvModalOpen, setIsExportAllToCsvModalOpen] = useState(false);
	const [selectedPupilCollectionIds, setSelectedPupilCollectionIds] = useState<string[]>([]);
	const [pupilCollectionsDeleteModalOpen, setPupilCollectionsDeleteModalOpen] =
		useState<boolean>(false);
	const [isChangeAuthorModalOpen, setIsChangeAuthorModalOpen] = useState<boolean>(false);

	const tableColumns = useMemo(() => GET_PUPIL_COLLECTIONS_OVERVIEW_TABLE_COLS(), []);

	const generateWhereObject = useCallback(
		(filters: Partial<PupilCollectionsOverviewTableState>) => {
			const andFilters: any[] = [];

			// Text search
			if (filters.query) {
				const query = `%${filters.query}%`;

				andFilters.push({
					_or: [
						{ collection_title: { _ilike: query } },
						{ owner: { full_name: { _ilike: query } } },
						{ assignment: { title: { _ilike: query } } },
						{ assignment: { owner: { full_name: { _ilike: query } } } },
					],
				});
			}

			// Author multi option filter
			andFilters.push(
				...getMultiOptionFilters(
					filters,
					['pupil', 'teacher'],
					['owner.profile_id', 'assignment.owner.profile_id']
				)
			);

			// Date filters
			andFilters.push(
				...getDateRangeFilters(
					filters,
					['created_at', 'updated_at', 'deadline_at'],
					['created_at', 'updated_at', 'assignment.deadline_at']
				)
			);

			// Status filter: active/expired
			if (!isNil(filters.status?.[0]) && filters.status?.length === 1) {
				if (filters.status?.[0] === 'true') {
					// Active assignment
					andFilters.push({
						assignment: {
							deadline_at: {
								_gte: new Date().toISOString(),
							},
						},
					});
				} else {
					// Assignment past deadline
					andFilters.push({
						assignment: {
							deadline_at: {
								_lt: new Date().toISOString(),
							},
						},
					});
				}
			}

			return { _and: andFilters };
		},
		[]
	);

	const getColumnDataType = useCallback(() => {
		const column = tableColumns.find((tableColumn: FilterableColumn) => {
			return get(tableColumn, 'id', '') === get(tableState, 'sort_column', 'empty');
		});
		return (column?.dataType || TableColumnDataType.string) as TableColumnDataType;
	}, [tableColumns, tableState]);

	const fetchPupilCollections = useCallback(async () => {
		try {
			setIsLoading(true);

			const { assignmentResponses, count } =
				await PupilCollectionService.fetchPupilCollectionsForAdmin(
					(tableState.page || 0) * ITEMS_PER_PAGE,
					ITEMS_PER_PAGE,
					(tableState.sort_column || 'created_at') as PupilCollectionOverviewTableColumns,
					tableState.sort_order || OrderDirection.desc,
					getColumnDataType(),
					generateWhereObject(getFilters(tableState))
				);

			setPupilCollections(assignmentResponses);
			setPupilCollectionsCount(count);
		} catch (err) {
			console.error(
				new CustomError('Failed to get pupil collections from the database', err, {
					tableState,
				})
			);
			setLoadingInfo({
				state: 'error',
				message: tHtml(
					'admin/pupil-collection/views/pupil-collections-overview___het-ophalen-van-de-leerlingencollecties-is-mislukt'
				),
			});
		}
		setIsLoading(false);
	}, [tableState, getColumnDataType, generateWhereObject, tHtml]);

	useEffect(() => {
		fetchPupilCollections();
	}, [fetchPupilCollections]);

	useEffect(() => {
		if (pupilCollections) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [fetchPupilCollections, pupilCollections]);

	const setAllPupilCollectionsAsSelected = async () => {
		setIsLoading(true);
		try {
			const pupilCollectionIds = await PupilCollectionService.getPupilCollectionIds(
				generateWhereObject(getFilters(tableState))
			);
			ToastService.info(
				tHtml(
					'admin/pupil-collection/views/pupil-collections-overview___je-hebt-num-of-selected-pupil-collections-geselecteerd',
					{
						numOfSelectedPupilCollections: pupilCollectionIds.length,
					}
				)
			);
			setSelectedPupilCollectionIds(pupilCollectionIds);
		} catch (err) {
			console.error(
				new CustomError(
					'Failed to fetch all pupil collection ids that adhere to the selected filters',
					err,
					{ tableState }
				)
			);
			ToastService.danger(
				tHtml(
					'admin/pupil-collection/views/pupil-collections-overview___het-ophalen-van-alle-geselecteerde-leerlingencollectie-ids-is-mislukt'
				)
			);
		}

		setIsLoading(false);
	};

	const handleBulkAction = async (action: AssignmentsBulkAction): Promise<void> => {
		const areRowsSelected = selectedPupilCollectionIds.length > 0;

		switch (action) {
			case AssignmentsBulkAction.DELETE:
				if (!areRowsSelected) return;
				setPupilCollectionsDeleteModalOpen(true);
				return;

			case AssignmentsBulkAction.CHANGE_AUTHOR:
				if (!areRowsSelected) return;
				setIsChangeAuthorModalOpen(true);
				return;

			case AssignmentsBulkAction.EXPORT_ALL:
				// No rows need to be selected, since we are exporting everything
				setIsExportAllToCsvModalOpen(true);
				return;
		}
	};

	const deleteSelectedAssignmentResponses = async () => {
		setIsLoading(true);
		setPupilCollectionsDeleteModalOpen(false);
		try {
			await AssignmentService.deleteAssignmentResponses(selectedPupilCollectionIds);
			await fetchPupilCollections();
			ToastService.success(
				tHtml(
					'admin/pupil-collection/views/pupil-collections-overview___je-hebt-num-of-selected-pupil-collections-leerlingencollecties-verwijderd',
					{
						numOfSelectedPupilCollections: selectedPupilCollectionIds.length,
					}
				)
			);
			setSelectedPupilCollectionIds([]);
		} catch (err) {
			console.error(
				new CustomError('Failed to delete the selected pupil collections', err, {
					tableState,
				})
			);
			ToastService.danger(
				tHtml(
					'admin/pupil-collection/views/pupil-collections-overview___het-verwijderen-van-de-geselecteerde-leerlingencollecties-is-mislukt'
				)
			);
		}
		setIsLoading(false);
	};

	const changeAuthorForSelectedPupilCollections = async (profileId: string) => {
		setIsLoading(true);
		try {
			await PupilCollectionService.changePupilCollectionsAuthor(
				profileId,
				selectedPupilCollectionIds
			);
			await fetchPupilCollections();
			ToastService.success(
				tHtml(
					'admin/pupil-collection/views/pupil-collections-overview___je-hebt-de-auteur-van-num-of-selected-pupil-collections-leerlingencollecties-aangepast',
					{
						numOfSelectedPupilCollections: selectedPupilCollectionIds.length,
					}
				)
			);
			setSelectedPupilCollectionIds([]);
		} catch (err) {
			console.error(
				new CustomError(
					'Failed to update the author of the selected pupil collections',
					err,
					{
						tableState,
					}
				)
			);
			ToastService.danger(
				tHtml(
					'admin/pupil-collection/views/pupil-collections-overview___het-updaten-van-de-auteur-van-de-geselecteerde-leerlingencollecties-is-mislukt'
				)
			);
		}
		setIsLoading(false);
	};

	const renderNoResults = () => {
		return (
			<ErrorView
				message={tHtml(
					'admin/pupil-collection/views/pupil-collections-overview___er-bestaan-nog-geen-leerlingencollecties'
				)}
			>
				<p>
					{tHtml(
						'admin/pupil-collection/views/pupil-collections-overview___beschrijving-wanneer-er-nog-geen-leerlingencollecties-zijn'
					)}
				</p>
			</ErrorView>
		);
	};

	const renderAssignmentOverview = () => {
		if (!pupilCollections) {
			return null;
		}
		return (
			<>
				<FilterTable
					columns={tableColumns}
					data={pupilCollections}
					dataCount={pupilCollectionsCount}
					renderCell={(rowData: any, columnId: string) =>
						renderPupilCollectionTableCellReact(
							rowData as Partial<Avo.Assignment.Response>,
							columnId as PupilCollectionOverviewTableColumns
						)
					}
					searchTextPlaceholder={tText(
						'admin/pupil-collection/views/pupil-collections-overview___zoek-op-titel-van-collectie-opdracht-naam-leerling'
					)}
					noContentMatchingFiltersMessage={tText(
						'admin/pupil-collection/views/pupil-collections-overview___er-zijn-geen-leerlingen-collecties-die-voldoen-aan-de-opgegeven-filters'
					)}
					itemsPerPage={ITEMS_PER_PAGE}
					onTableStateChanged={(newTableState) => {
						setTableState(newTableState);
					}}
					renderNoResults={renderNoResults}
					isLoading={isLoading}
					showCheckboxes
					selectedItemIds={selectedPupilCollectionIds}
					onSelectionChanged={(ids: ReactText[]) => {
						setSelectedPupilCollectionIds(ids as string[]);
					}}
					onSelectAll={setAllPupilCollectionsAsSelected}
					bulkActions={GET_PUPIL_COLLECTION_BULK_ACTIONS(
						commonUser,
						selectedPupilCollectionIds.length > 0
					)}
					onSelectBulkAction={handleBulkAction as any}
					rowKey="id"
					defaultOrderProp={'created_at'}
					defaultOrderDirection={OrderDirection.desc}
				/>
				<ConfirmModal
					body={tHtml(
						'admin/pupil-collection/views/pupil-collections-overview___dit-zal-num-of-selected-pupil-collections-leerlingencollecties-verwijderen-deze-actie-kan-niet-ongedaan-gemaakt-worden',
						{ numOfSelectedPupilCollections: selectedPupilCollectionIds.length }
					)}
					isOpen={pupilCollectionsDeleteModalOpen}
					onClose={() => setPupilCollectionsDeleteModalOpen(false)}
					confirmCallback={deleteSelectedAssignmentResponses}
				/>
				<ChangeAuthorModal
					isOpen={isChangeAuthorModalOpen}
					onClose={() => setIsChangeAuthorModalOpen(false)}
					callback={(newAuthor: PickerItem) =>
						changeAuthorForSelectedPupilCollections(newAuthor.value)
					}
				/>{' '}
				<ExportAllToCsvModal
					title={tText(
						'admin/pupil-collection/views/pupil-collections-overview___exporteren-van-alle-leerling-collecties-naar-csv'
					)}
					isOpen={isExportAllToCsvModalOpen}
					onClose={() => setIsExportAllToCsvModalOpen(false)}
					itemsPerRequest={20}
					fetchingItemsLabel={tText(
						'admin/pupil-collection/views/pupil-collections-overview___bezig-met-ophalen-van-leerling-collecties'
					)}
					generatingCsvLabel={tText(
						'admin/pupil-collection/views/pupil-collections-overview___bezig-met-genereren-van-de-csv'
					)}
					fetchTotalItems={async () => {
						const response = await PupilCollectionService.fetchPupilCollectionsForAdmin(
							0,
							0,
							(tableState.sort_column ||
								'created_at') as PupilCollectionOverviewTableColumns,
							tableState.sort_order || OrderDirection.desc,
							getColumnDataType(),
							{}
						);
						return response.count;
					}}
					fetchMoreItems={async (offset: number, limit: number) => {
						const response = await PupilCollectionService.fetchPupilCollectionsForAdmin(
							offset,
							limit,
							(tableState.sort_column ||
								'created_at') as PupilCollectionOverviewTableColumns,
							tableState.sort_order || OrderDirection.desc,
							getColumnDataType(),
							generateWhereObject(getFilters(tableState))
						);
						return response.assignmentResponses;
					}}
					renderValue={(pupilCollection: any, columnId: string) =>
						renderPupilCollectionTableCellText(
							pupilCollection as Partial<Avo.Assignment.Response>,
							columnId as PupilCollectionOverviewTableColumns
						)
					}
					columns={tableColumnListToCsvColumnList(tableColumns)}
					exportFileName={tText(
						'admin/pupil-collection/views/pupil-collections-overview___leerling-collecties-csv'
					)}
				/>
			</>
		);
	};

	return (
		<PermissionGuard permissions={[PermissionName.VIEW_ANY_PUPIL_COLLECTIONS]}>
			<AdminLayout
				pageTitle={tText(
					'admin/pupil-collection/views/pupil-collections-overview___leerlingencollecties'
				)}
				size="full-width"
			>
				<AdminLayoutBody>
					<Helmet>
						<title>
							{GENERATE_SITE_TITLE(
								tText(
									'admin/pupil-collection/views/pupil-collections-overview___leerlingencollecties-overzicht-pagina-titel'
								)
							)}
						</title>
						<meta
							name="description"
							content={tText(
								'admin/pupil-collection/views/pupil-collections-overview___leerlingencollecties-overzicht-pagina-beschrijving'
							)}
						/>
					</Helmet>
					<LoadingErrorLoadedComponent
						loadingInfo={loadingInfo}
						dataObject={pupilCollections}
						render={renderAssignmentOverview}
					/>
				</AdminLayoutBody>
			</AdminLayout>
		</PermissionGuard>
	);
};
