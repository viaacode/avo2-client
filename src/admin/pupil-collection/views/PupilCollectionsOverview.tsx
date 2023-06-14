import { Button, IconName } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { get, isNil } from 'lodash-es';
import React, {
	FunctionComponent,
	ReactText,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import MetaTags from 'react-meta-tags';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS } from '../../../assignment/assignment.const';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import { PupilCollectionService } from '../../../pupil-collection/pupil-collection.service';
import { PupilCollectionOverviewTableColumns } from '../../../pupil-collection/pupil-collection.types';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import ConfirmModal from '../../../shared/components/ConfirmModal/ConfirmModal';
import { buildLink, CustomError, formatDate } from '../../../shared/helpers';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import withUser, { UserProps } from '../../../shared/hocs/withUser';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { TableColumnDataType } from '../../../shared/types/table-column-data-type';
import { AssignmentsBulkAction } from '../../assignments/assignments.types';
import ChangeAuthorModal from '../../shared/components/ChangeAuthorModal/ChangeAuthorModal';
import FilterTable, {
	FilterableColumn,
	getFilters,
} from '../../shared/components/FilterTable/FilterTable';
import { getDateRangeFilters, getMultiOptionFilters } from '../../shared/helpers/filters';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';
import { PickerItem } from '../../shared/types';
import {
	GET_PUPIL_COLLECTION_BULK_ACTIONS,
	GET_PUPIL_COLLECTIONS_OVERVIEW_TABLE_COLS,
	ITEMS_PER_PAGE,
} from '../pupil-collection.const';
import { PupilCollectionsOverviewTableState } from '../pupil-collection.types';

const PupilCollectionsOverview: FunctionComponent<RouteComponentProps & UserProps> = ({ user }) => {
	const { tText, tHtml } = useTranslation();

	const [pupilCollections, setPupilCollections] = useState<Avo.Assignment.Response[] | null>(
		null
	);
	const [pupilCollectionsCount, setPupilCollectionsCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<PupilCollectionsOverviewTableState>>({
		sort_column: 'created_at',
		sort_order: 'desc',
	});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [selectedPupilCollectionIds, setSelectedPupilCollectionIds] = useState<string[]>([]);
	const [pupilCollectionsDeleteModalOpen, setPupilCollectionsDeleteModalOpen] =
		useState<boolean>(false);
	const [isChangeAuthorModalOpen, setIsChangeAuthorModalOpen] = useState<boolean>(false);

	const columns = useMemo(() => GET_PUPIL_COLLECTIONS_OVERVIEW_TABLE_COLS(), []);

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

	const fetchPupilCollections = useCallback(async () => {
		try {
			setIsLoading(true);

			const column = columns.find((tableColumn: FilterableColumn) => {
				return get(tableColumn, 'id', '') === get(tableState, 'sort_column', 'empty');
			});
			const columnDataType = (column?.dataType ||
				TableColumnDataType.string) as TableColumnDataType;
			const [pupilCollectionsTemp, pupilCollectionsCountTemp] =
				await PupilCollectionService.fetchPupilCollectionsForAdmin(
					tableState.page || 0,
					(tableState.sort_column || 'created_at') as PupilCollectionOverviewTableColumns,
					tableState.sort_order || 'desc',
					columnDataType,
					generateWhereObject(getFilters(tableState))
				);

			setPupilCollections(pupilCollectionsTemp);
			setPupilCollectionsCount(pupilCollectionsCountTemp);
		} catch (err) {
			console.error(
				new CustomError('Failed to get pupil collections from the database', err, {
					tableState,
				})
			);
			setLoadingInfo({
				state: 'error',
				message: tText(
					'admin/pupil-collection/views/pupil-collections-overview___het-ophalen-van-de-leerlingencollecties-is-mislukt'
				),
			});
		}
		setIsLoading(false);
	}, [columns, tableState, generateWhereObject, tText]);

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
		if (!selectedPupilCollectionIds || !selectedPupilCollectionIds.length) {
			return;
		}
		switch (action) {
			case 'delete':
				setPupilCollectionsDeleteModalOpen(true);
				return;

			case 'change_author':
				setIsChangeAuthorModalOpen(true);
				return;
		}
	};

	const deleteSelectedAssignmentResponses = async () => {
		setIsLoading(true);
		setPupilCollectionsDeleteModalOpen(false);
		try {
			await PupilCollectionService.deleteAssignmentResponses(selectedPupilCollectionIds);
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

	const renderTableCell = (
		pupilCollection: Partial<Avo.Assignment.Response>,
		columnId: PupilCollectionOverviewTableColumns
	) => {
		const { id, created_at, updated_at, assignment_id, assignment } = pupilCollection;

		switch (columnId) {
			case 'title':
				return (
					<Link
						to={buildLink(APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_DETAIL.route, {
							assignmentId: assignment_id,
							responseId: id,
						})}
					>
						{truncateTableValue(pupilCollection?.collection_title || '-')}
					</Link>
				);

			case 'pupil':
				return truncateTableValue(pupilCollection?.owner?.full_name);

			case 'assignmentTitle':
				return (
					<Link to={buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, { id: assignment_id })}>
						{truncateTableValue(assignment?.title || '-')}
					</Link>
				);

			case 'teacher':
				return truncateTableValue(pupilCollection?.assignment?.owner?.full_name);

			case 'created_at':
				return formatDate(created_at) || '-';

			case 'updated_at':
				return formatDate(updated_at) || '-';

			case 'deadline_at':
				return formatDate(assignment?.deadline_at) || '-';

			case 'status':
				return !!assignment?.deadline_at &&
					new Date(assignment?.deadline_at).getTime() < new Date().getTime()
					? tText('admin/pupil-collection/views/pupil-collections-overview___afgelopen')
					: tText('admin/pupil-collection/views/pupil-collections-overview___actief');

			case 'actions':
			default:
				// TODO link to correct edit page for pupil collection
				//localhost:8080/werkruimte/opdrachten/de61d05b-ab4c-4651-a631-d97f76e9f280/antwoorden/6b7ebe33-6cdf-4e7f-b5d4-a38b8e2fa8b8
				return (
					<Link
						to={buildLink(
							APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_ADMIN_EDIT.route,
							{
								assignmentId: assignment?.id,
								responseId: id,
							},
							{ tab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.MY_COLLECTION }
						)}
					>
						<Button
							icon={IconName.edit2}
							ariaLabel="Bewerk deze opdracht"
							type="secondary"
						/>
					</Link>
				);
		}
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
					columns={columns}
					data={pupilCollections}
					dataCount={pupilCollectionsCount}
					renderCell={(rowData: Partial<Avo.Assignment.Response>, columnId: string) =>
						renderTableCell(rowData, columnId as PupilCollectionOverviewTableColumns)
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
					onSelectBulkAction={handleBulkAction as any}
					bulkActions={GET_PUPIL_COLLECTION_BULK_ACTIONS(user as Avo.User.User)}
					rowKey="id"
					defaultOrderProp={'created_at'}
					defaultOrderDirection={'desc'}
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
				/>
			</>
		);
	};

	return (
		<AdminLayout
			pageTitle={tText(
				'admin/pupil-collection/views/pupil-collections-overview___leerlingencollecties'
			)}
			size="full-width"
		>
			<AdminLayoutBody>
				<MetaTags>
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
				</MetaTags>
				<LoadingErrorLoadedComponent
					loadingInfo={loadingInfo}
					dataObject={pupilCollections}
					render={renderAssignmentOverview}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default compose(
	withRouter,
	withUser
)(PupilCollectionsOverview) as unknown as FunctionComponent;
