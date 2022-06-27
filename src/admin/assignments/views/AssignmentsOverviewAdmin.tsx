import { get, isNil } from 'lodash-es';
import React, {
	FunctionComponent,
	ReactText,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { Button } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { AssignmentService } from '../../../assignment/assignment.service';
import { AssignmentOverviewTableColumns } from '../../../assignment/assignment.types';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import ConfirmModal from '../../../shared/components/ConfirmModal/ConfirmModal';
import { buildLink, CustomError, formatDate } from '../../../shared/helpers';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import withUser, { UserProps } from '../../../shared/hocs/withUser';
import { ToastService } from '../../../shared/services';
import { TableColumnDataType } from '../../../shared/types/table-column-data-type';
import ChangeAuthorModal from '../../shared/components/ChangeAuthorModal/ChangeAuthorModal';
import FilterTable, {
	FilterableColumn,
	getFilters,
} from '../../shared/components/FilterTable/FilterTable';
import { getDateRangeFilters, getMultiOptionFilters } from '../../shared/helpers/filters';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';
import { PickerItem } from '../../shared/types';
import {
	GET_ASSIGNMENT_BULK_ACTIONS,
	GET_ASSIGNMENT_OVERVIEW_TABLE_COLS,
	ITEMS_PER_PAGE,
} from '../assignments.const';
import { AssignmentsBulkAction, AssignmentsOverviewTableState } from '../assignments.types';

interface AssignmentOverviewAdminProps {}

const AssignmentOverviewAdmin: FunctionComponent<
	AssignmentOverviewAdminProps & RouteComponentProps & UserProps
> = ({ user }) => {
	const [t] = useTranslation();

	const [assignments, setAssignments] = useState<Avo.Assignment.Assignment_v2[] | null>(null);
	const [assignmentCount, setAssignmentCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<AssignmentsOverviewTableState>>({
		sort_column: 'created_at',
		sort_order: 'desc',
	});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<string[]>([]);
	const [assignmentsDeleteModalOpen, setAssignmentsDeleteModalOpen] = useState<boolean>(false);
	const [isChangeAuthorModalOpen, setIsChangeAuthorModalOpen] = useState<boolean>(false);

	const columns = useMemo(() => GET_ASSIGNMENT_OVERVIEW_TABLE_COLS(), []);

	const generateWhereObject = useCallback((filters: Partial<AssignmentsOverviewTableState>) => {
		const andFilters: any[] = [];

		// Text search
		if (filters.query) {
			const query = `%${filters.query}%`;

			andFilters.push({
				_or: [{ title: { _ilike: query } }, { owner: { full_name: { _ilike: query } } }],
			});
		}

		// Author multi option filter
		andFilters.push(...getMultiOptionFilters(filters, ['owner'], ['owner.profile_id']));

		// Date filters
		andFilters.push(
			...getDateRangeFilters(
				filters,
				['created_at', 'updated_at', 'deadline_at'],
				['created_at', 'updated_at', 'deadline_at']
			)
		);

		// Status filter: active/expired
		if (!isNil(filters.status?.[0]) && filters.status?.length === 1) {
			if (filters.status?.[0] === 'true') {
				// Active assignment
				andFilters.push({
					deadline_at: {
						_gte: new Date().toISOString(),
					},
				});
			} else {
				// Assignment past deadline
				andFilters.push({
					deadline_at: {
						_lt: new Date().toISOString(),
					},
				});
			}
		}

		return { _and: andFilters };
	}, []);

	const fetchAssignments = useCallback(async () => {
		try {
			setIsLoading(true);

			const column = columns.find((tableColumn: FilterableColumn) => {
				return get(tableColumn, 'id', '') === get(tableState, 'sort_column', 'empty');
			});
			const columnDataType = get(column, 'dataType', 'string') as TableColumnDataType;
			const [
				assignmentsTemp,
				assignmentCountTemp,
			] = await AssignmentService.fetchAssignmentsForAdmin(
				tableState.page || 0,
				(tableState.sort_column || 'created_at') as AssignmentOverviewTableColumns,
				tableState.sort_order || 'desc',
				columnDataType,
				generateWhereObject(getFilters(tableState))
			);

			setAssignments(assignmentsTemp);
			setAssignmentCount(assignmentCountTemp);
		} catch (err) {
			console.error(
				new CustomError('Failed to get assignments from the database', err, { tableState })
			);
			setLoadingInfo({
				state: 'error',
				message: t(
					'admin/assignments/views/assignment-overview___het-ophalen-van-de-gebruikers-is-mislukt'
				),
			});
		}
		setIsLoading(false);
	}, [columns, tableState, generateWhereObject, t]);

	useEffect(() => {
		fetchAssignments();
	}, [fetchAssignments]);

	useEffect(() => {
		if (assignments) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [fetchAssignments, assignments]);

	const setAllAssignmentsAsSelected = async () => {
		setIsLoading(true);
		try {
			const assignmentIds = await AssignmentService.getAssignmentIds(
				generateWhereObject(getFilters(tableState))
			);
			ToastService.info(
				t('Je hebt {{numOfSelectedAssignments}} geselecteerd', {
					numOfSelectedAssignments: assignmentIds.length,
				})
			);
			setSelectedAssignmentIds(assignmentIds);
		} catch (err) {
			console.error(
				new CustomError(
					'Failed to fetch all assignment ids that adhere to the selected filters',
					err,
					{ tableState }
				)
			);
			ToastService.danger(t("Het ophalen van alle geselecteerde opdrachten id's is mislukt"));
		}

		setIsLoading(false);
	};

	const handleBulkAction = async (action: AssignmentsBulkAction): Promise<void> => {
		if (!selectedAssignmentIds || !selectedAssignmentIds.length) {
			return;
		}
		switch (action) {
			case 'delete':
				setAssignmentsDeleteModalOpen(true);
				return;

			case 'change_author':
				setIsChangeAuthorModalOpen(true);
				return;
		}
	};

	const deleteSelectedAssignments = async () => {
		setIsLoading(true);
		try {
			await AssignmentService.deleteAssignments(selectedAssignmentIds);
			await fetchAssignments();
			ToastService.success(
				t('Je hebt {{numOfSelectedAssignments}} verwijderd', {
					numOfSelectedAssignments: selectedAssignmentIds.length,
				})
			);
			setSelectedAssignmentIds([]);
		} catch (err) {
			console.error(
				new CustomError('Failed to delete the selected assignments', err, { tableState })
			);
			ToastService.danger(t('Het verwijderen van de geselecteerde opdrachten is mislukt'));
		}
		setIsLoading(false);
	};

	const changeAuthorForSelectedAssignments = async (profileId: string) => {
		setIsLoading(true);
		try {
			await AssignmentService.changeAuthor(profileId, selectedAssignmentIds);
			await fetchAssignments();
			ToastService.success(
				t('Je hebt de auteur van {{numOfSelectedAssignments}} aangepast', {
					numOfSelectedAssignments: selectedAssignmentIds.length,
				})
			);
			setSelectedAssignmentIds([]);
		} catch (err) {
			console.error(
				new CustomError('Failed to update the author of the selected assignments', err, {
					tableState,
				})
			);
			ToastService.danger(
				t('Het updaten van de auteur van de geselecteerde opdrachten is mislukt')
			);
		}
		setIsLoading(false);
	};

	const renderTableCell = (
		assignment: Partial<Avo.Assignment.Assignment_v2>,
		columnId: AssignmentOverviewTableColumns
	) => {
		const { id, created_at, updated_at, deadline_at } = assignment;

		switch (columnId) {
			case 'title':
				return (
					<Link to={buildLink(APP_PATH.ASSIGNMENT_EDIT.route, { id })}>
						{truncateTableValue(assignment.title)}
					</Link>
				);

			case 'owner':
				return truncateTableValue((assignment as any)?.owner?.full_name);

			case 'created_at':
				return formatDate(created_at) || '-';

			case 'updated_at':
				return formatDate(updated_at) || '-';

			case 'deadline_at':
				return formatDate(deadline_at) || '-';

			case 'status':
				return !!assignment.deadline_at &&
					new Date(assignment.deadline_at).getTime() < new Date().getTime()
					? t('Afgelopen')
					: t('Actief');

			case 'responses':
				if ((assignment.responses?.length || 0) >= 1) {
					return <Link to="#">{assignment.responses?.length}</Link>; // TODO add link to responses page
				}
				if (assignment.assignment_type === 'BOUW') {
					return t('Aantal leerlingen collecties');
				}
				return t('nvt');

			case 'views':
				return truncateTableValue('0'); // TODO implement views for assignments

			case 'actions':
			default:
				return (
					<Link to={buildLink(APP_PATH.ASSIGNMENT_EDIT.route, { id: assignment.id })}>
						<Button icon="edit-2" ariaLabel="Bewerk deze opdracht" type="secondary" />
					</Link>
				);
		}
	};

	const renderNoResults = () => {
		return (
			<ErrorView
				message={t(
					'admin/assignments/views/assignment-overview___er-bestaan-nog-geen-gebruikers'
				)}
			>
				<p>
					<Trans i18nKey="admin/assignments/views/assignment-overview___beschrijving-wanneer-er-nog-geen-gebruikers-zijn">
						Beschrijving wanneer er nog geen gebruikers zijn
					</Trans>
				</p>
			</ErrorView>
		);
	};

	const renderAssignmentOverview = () => {
		if (!assignments) {
			return null;
		}
		return (
			<>
				<FilterTable
					columns={columns}
					data={assignments}
					dataCount={assignmentCount}
					renderCell={(
						rowData: Partial<Avo.Assignment.Assignment_v2>,
						columnId: string
					) => renderTableCell(rowData, columnId as AssignmentOverviewTableColumns)}
					searchTextPlaceholder={t(
						'admin/assignments/views/assignment-overview___zoek-op-naam-email-alias'
					)}
					noContentMatchingFiltersMessage={t(
						'admin/assignments/views/assignment-overview___er-zijn-geen-gebruikers-doe-voldoen-aan-de-opgegeven-filters'
					)}
					itemsPerPage={ITEMS_PER_PAGE}
					onTableStateChanged={(newTableState) => {
						setTableState(newTableState);
					}}
					renderNoResults={renderNoResults}
					isLoading={isLoading}
					showCheckboxes
					selectedItemIds={selectedAssignmentIds}
					onSelectionChanged={setSelectedAssignmentIds as (ids: ReactText[]) => void}
					onSelectAll={setAllAssignmentsAsSelected}
					onSelectBulkAction={handleBulkAction as any}
					bulkActions={GET_ASSIGNMENT_BULK_ACTIONS(user as Avo.User.User)}
					rowKey="id"
					defaultOrderProp={'created_at'}
					defaultOrderDirection={'desc'}
				/>
				<ConfirmModal
					body={t(
						'Dit zal {{numOfSelectedAssignment}} opdrachten verwijderen. Deze actie kan niet ongedaan gemaakt worden!',
						{ numOfSelectedAssignment: selectedAssignmentIds.length }
					)}
					isOpen={assignmentsDeleteModalOpen}
					onClose={() => setAssignmentsDeleteModalOpen(false)}
					deleteObjectCallback={deleteSelectedAssignments}
				/>
				<ChangeAuthorModal
					isOpen={isChangeAuthorModalOpen}
					onClose={() => setIsChangeAuthorModalOpen(false)}
					callback={(newAuthor: PickerItem) =>
						changeAuthorForSelectedAssignments(newAuthor.value)
					}
				/>
			</>
		);
	};

	return (
		<AdminLayout pageTitle={t('Opdrachten')} size="full-width">
			<AdminLayoutBody>
				<MetaTags>
					<title>{GENERATE_SITE_TITLE(t('opdrachten-overzicht-pagina-titel'))}</title>
					<meta
						name="description"
						content={t('opdrachten-overzicht-pagina-beschrijving')}
					/>
				</MetaTags>
				<LoadingErrorLoadedComponent
					loadingInfo={loadingInfo}
					dataObject={assignments}
					render={renderAssignmentOverview}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default (compose(
	withRouter,
	withUser
)(AssignmentOverviewAdmin) as unknown) as FunctionComponent<AssignmentOverviewAdminProps>;
