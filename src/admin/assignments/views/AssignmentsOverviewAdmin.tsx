import { Button, IconName } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { get, isNil, partition } from 'lodash-es';
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

import { ASSIGNMENT_CREATE_UPDATE_TABS } from '../../../assignment/assignment.const';
import { AssignmentService } from '../../../assignment/assignment.service';
import {
	AssignmentOverviewTableColumns,
	AssignmentType,
} from '../../../assignment/assignment.types';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import ConfirmModal from '../../../shared/components/ConfirmModal/ConfirmModal';
import { buildLink, CustomError, formatDate } from '../../../shared/helpers';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import withUser, { UserProps } from '../../../shared/hocs/withUser';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { TableColumnDataType } from '../../../shared/types/table-column-data-type';
import { ADMIN_PATH } from '../../admin.const';
import ChangeAuthorModal from '../../shared/components/ChangeAuthorModal/ChangeAuthorModal';
import FilterTable, {
	FilterableColumn,
	getFilters,
} from '../../shared/components/FilterTable/FilterTable';
import SubjectsBeingEditedWarningModal from '../../shared/components/SubjectsBeingEditedWarningModal/SubjectsBeingEditedWarningModal';
import { getDateRangeFilters, getMultiOptionFilters } from '../../shared/helpers/filters';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';
import { PickerItem } from '../../shared/types';
import {
	GET_ASSIGNMENT_BULK_ACTIONS,
	GET_ASSIGNMENT_OVERVIEW_TABLE_COLS,
	ITEMS_PER_PAGE,
} from '../assignments.const';
import { AssignmentsBulkAction, AssignmentsOverviewTableState } from '../assignments.types';

import './AssignmentsOverviewAdmin.scss';

const AssignmentOverviewAdmin: FunctionComponent<RouteComponentProps & UserProps> = ({ user }) => {
	const { tText, tHtml } = useTranslation();

	const [assignments, setAssignments] = useState<Avo.Assignment.Assignment[] | null>(null);
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
	const [assignmentsBeingEdited, setAssignmentsBeingEdited] = useState<Avo.Share.EditStatus[]>(
		[]
	);
	const [selectedBulkAction, setSelectedBulkAction] = useState<AssignmentsBulkAction | null>(
		null
	);

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
		andFilters.push(...getMultiOptionFilters(filters, ['author'], ['owner.profile_id']));

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

		// pupil collections filter: has collections, does not have collections
		if (!isNil(filters.pupilCollections?.[0]) && filters.pupilCollections?.length === 1) {
			if (filters.pupilCollections?.[0] === 'true') {
				// Assignments with pupil collections
				andFilters.push({
					responses: {
						collection_title: { _is_null: false },
					},
				});
			} else {
				// Assignments without pupil collections
				andFilters.push({
					_not: {
						responses: {
							collection_title: { _is_null: false },
						},
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
			const columnDataType = (column?.dataType ||
				TableColumnDataType.string) as TableColumnDataType;
			const [assignmentsTemp, assignmentCountTemp] =
				await AssignmentService.fetchAssignmentsForAdmin(
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
				message: tHtml(
					'admin/assignments/views/assignments-overview-admin___het-ophalen-van-de-opdrachten-is-mislukt'
				),
			});
		}
		setIsLoading(false);
	}, [columns, tableState, generateWhereObject, tText]);

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
				tHtml(
					'admin/assignments/views/assignments-overview-admin___je-hebt-num-of-selected-assignments-geselecteerd',
					{
						numOfSelectedAssignments: assignmentIds.length,
					}
				)
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
			ToastService.danger(
				tHtml(
					'admin/assignments/views/assignments-overview-admin___het-ophalen-van-alle-geselecteerde-opdrachten-ids-is-mislukt'
				)
			);
		}

		setIsLoading(false);
	};

	const handleBulkAction = async (action: AssignmentsBulkAction): Promise<void> => {
		if (!selectedAssignmentIds || !selectedAssignmentIds.length) {
			return;
		}

		const selectedAssignmentEditStatuses = await AssignmentService.getAssignmentsEditStatuses(
			selectedAssignmentIds
		);
		const partitionedAssignmentIds = partition(
			Object.entries(selectedAssignmentEditStatuses),
			(entry) => !!entry[1]
		);
		const selectedAssignmentsThatAreBeingEdited: Avo.Share.EditStatus[] =
			partitionedAssignmentIds[0].map((entry) => entry[1]);
		const selectedAssignmentIdsThatAreNotBeingEdited = partitionedAssignmentIds[1].map(
			(entry) => entry[0]
		);

		if (selectedAssignmentsThatAreBeingEdited.length > 0) {
			// open warning modal first
			setSelectedAssignmentIds(selectedAssignmentIdsThatAreNotBeingEdited);
			setSelectedBulkAction(action);
			setAssignmentsBeingEdited(selectedAssignmentsThatAreBeingEdited);
		} else {
			// execute action straight away
			setAssignmentsBeingEdited([]);
			setSelectedBulkAction(null);
			switch (action) {
				case 'delete':
					setAssignmentsDeleteModalOpen(true);
					return;

				case 'change_author':
					setIsChangeAuthorModalOpen(true);
					return;
			}
		}
	};

	const deleteSelectedAssignments = async () => {
		setIsLoading(true);
		setAssignmentsBeingEdited([]);
		setSelectedBulkAction(null);
		setAssignmentsDeleteModalOpen(false);
		try {
			await AssignmentService.deleteAssignments(selectedAssignmentIds);
			await fetchAssignments();
			ToastService.success(
				tHtml(
					'admin/assignments/views/assignments-overview-admin___je-hebt-num-of-selected-assignments-verwijderd',
					{
						numOfSelectedAssignments: selectedAssignmentIds.length,
					}
				)
			);
			setSelectedAssignmentIds([]);
		} catch (err) {
			console.error(
				new CustomError('Failed to delete the selected assignments', err, { tableState })
			);
			ToastService.danger(
				tHtml(
					'admin/assignments/views/assignments-overview-admin___het-verwijderen-van-de-geselecteerde-opdrachten-is-mislukt'
				)
			);
		}
		setIsLoading(false);
	};

	const changeAuthorForSelectedAssignments = async (profileId: string) => {
		setIsLoading(true);
		setAssignmentsBeingEdited([]);
		setSelectedBulkAction(null);
		try {
			await AssignmentService.changeAssignmentsAuthor(profileId, selectedAssignmentIds);
			await fetchAssignments();
			ToastService.success(
				tHtml(
					'admin/assignments/views/assignments-overview-admin___je-hebt-de-auteur-van-num-of-selected-assignments-aangepast',
					{
						numOfSelectedAssignments: selectedAssignmentIds.length,
					}
				)
			);
			setSelectedAssignmentIds([]);
		} catch (err) {
			console.error(
				new CustomError('Failed to update the author of the selected assignments', err, {
					tableState,
				})
			);
			ToastService.danger(
				tHtml(
					'admin/assignments/views/assignments-overview-admin___het-updaten-van-de-auteur-van-de-geselecteerde-opdrachten-is-mislukt'
				)
			);
		}
		setIsLoading(false);
	};

	const renderTableCell = (
		assignment: Partial<Avo.Assignment.Assignment>,
		columnId: AssignmentOverviewTableColumns
	) => {
		const { id, created_at, updated_at, deadline_at } = assignment;

		switch (columnId) {
			case 'title':
				return (
					<Link to={buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, { id })}>
						{truncateTableValue(assignment.title)}
					</Link>
				);

			case 'author':
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
					? tText('admin/assignments/views/assignments-overview-admin___afgelopen')
					: tText('admin/assignments/views/assignments-overview-admin___actief');

			case 'responses': {
				const responsesLength =
					(assignment as any)?.responses_aggregate?.aggregate?.count || 0;
				if (responsesLength >= 1) {
					return (
						<Link
							to={buildLink(
								ADMIN_PATH.ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW,
								{},
								{
									query: assignment.title || '',
									teacher: (assignment?.owner as any)?.profile_id as string,
								}
							)}
						>
							{responsesLength}
						</Link>
					);
				}
				if (assignment.lom_learning_resource_type?.includes(AssignmentType.BOUW)) {
					return tText(
						'admin/assignments/views/assignments-overview-admin___aantal-leerlingen-collecties'
					);
				}
				return tText('admin/assignments/views/assignments-overview-admin___nvt');
			}

			case 'views':
				return assignment?.view_count?.count || '0';

			case 'actions':
			default:
				return (
					<Link
						to={buildLink(APP_PATH.ASSIGNMENT_EDIT_TAB.route, {
							id: assignment.id,
							tabId: ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT,
						})}
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
					'admin/assignments/views/assignments-overview-admin___er-bestaan-nog-geen-opdrachten'
				)}
			>
				<p>
					{tHtml(
						'admin/assignments/views/assignments-overview-admin___beschrijving-wanneer-er-nog-geen-opdrachten-zijn'
					)}
				</p>
			</ErrorView>
		);
	};

	const renderAssignmentBeingEditedMessage = () => {
		return (
			<>
				<p>
					{tHtml(
						'admin/assignments/views/assignments-overview-admin___deze-opdrachten-worden-momenteel-bewerkt'
					)}
				</p>
				<ul className="c-assignment-bulk-warning-being-edited">
					{assignmentsBeingEdited.map((assignmentBeingEdited) => (
						<li key={`assignment-being-edited-${assignmentBeingEdited.subjectId}`}>
							<a
								target="_blank"
								href={buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, {
									id: assignmentBeingEdited.subjectId,
								})}
								rel="noreferrer"
							>
								{assignmentBeingEdited.subjectTitle}
							</a>
						</li>
					))}
				</ul>
				<p>
					{tHtml(
						'admin/assignments/views/assignments-overview-admin___je-kan-doorgaan-met-je-actie-maar-deze-opdrachten-zullen-niet-behandeld-worden'
					)}
				</p>
			</>
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
					renderCell={(rowData: Partial<Avo.Assignment.Assignment>, columnId: string) =>
						renderTableCell(rowData, columnId as AssignmentOverviewTableColumns)
					}
					searchTextPlaceholder={tText(
						'admin/assignments/views/assignments-overview-admin___zoeken-op-titel-en-auteur'
					)}
					noContentMatchingFiltersMessage={tText(
						'admin/assignments/views/assignments-overview-admin___er-zijn-geen-opdrachten-die-voldoen-aan-de-opgegeven-filters'
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
				<SubjectsBeingEditedWarningModal
					isOpen={assignmentsBeingEdited?.length > 0}
					onClose={() => {
						setAssignmentsDeleteModalOpen(false);
						setAssignmentsBeingEdited([]);
						setSelectedBulkAction(null);
					}}
					confirmCallback={async () => {
						setAssignmentsBeingEdited([]);
						if (selectedAssignmentIds.length > 0) {
							await handleBulkAction(selectedBulkAction as AssignmentsBulkAction);
						} else {
							ToastService.info(
								tHtml(
									'admin/assignments/views/assignments-overview-admin___alle-geselecteerde-opdrachten-worden-bewerkt-dus-de-actie-kan-niet-worden-uitgevoerd'
								)
							);
						}
					}}
					title={tHtml(
						'admin/assignments/views/assignments-overview-admin___enkele-opdrachten-worden-bewerkt'
					)}
					editWarningSection1={tHtml(
						'admin/assignments/views/assignments-overview-admin___deze-opdrachten-worden-momenteel-bewerkt'
					)}
					editWarningSection2={tHtml(
						'admin/assignments/views/assignments-overview-admin___je-kan-doorgaan-met-je-actie-maar-deze-opdrachten-zullen-niet-behandeld-worden'
					)}
					subjects={assignmentsBeingEdited}
					route={APP_PATH.ASSIGNMENT_DETAIL.route}
				/>
				<ConfirmModal
					body={renderAssignmentBeingEditedMessage()}
					isOpen={assignmentsBeingEdited?.length > 0}
					onClose={() => {
						setAssignmentsDeleteModalOpen(false);
						setAssignmentsBeingEdited([]);
						setSelectedBulkAction(null);
					}}
					confirmCallback={async () => {
						setAssignmentsBeingEdited([]);
						if (selectedAssignmentIds.length > 0) {
							await handleBulkAction(selectedBulkAction as AssignmentsBulkAction);
						} else {
							ToastService.info(
								tHtml(
									'admin/assignments/views/assignments-overview-admin___alle-geselecteerde-opdrachten-worden-bewerkt-dus-de-actie-kan-niet-worden-uitgevoerd'
								)
							);
						}
					}}
					confirmButtonType="primary"
					confirmLabel={tText(
						'admin/assignments/views/assignments-overview-admin___doorgaan'
					)}
				/>
				<ConfirmModal
					body={tHtml(
						'admin/assignments/views/assignments-overview-admin___dit-zal-num-of-selected-assignment-opdrachten-verwijderen-deze-actie-kan-niet-ongedaan-gemaakt-worden',
						{ numOfSelectedAssignment: selectedAssignmentIds.length }
					)}
					isOpen={assignmentsDeleteModalOpen}
					onClose={() => {
						setAssignmentsDeleteModalOpen(false);
						setAssignmentsBeingEdited([]);
						setSelectedBulkAction(null);
					}}
					confirmCallback={deleteSelectedAssignments}
				/>
				<ChangeAuthorModal
					isOpen={isChangeAuthorModalOpen}
					onClose={() => {
						setIsChangeAuthorModalOpen(false);
						setAssignmentsBeingEdited([]);
						setSelectedBulkAction(null);
					}}
					callback={(newAuthor: PickerItem) =>
						changeAuthorForSelectedAssignments(newAuthor.value)
					}
				/>
			</>
		);
	};

	return (
		<AdminLayout
			pageTitle={tText('admin/assignments/views/assignments-overview-admin___opdrachten')}
			size="full-width"
		>
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							tText(
								'admin/assignments/views/assignments-overview-admin___opdrachten-overzicht-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'admin/assignments/views/assignments-overview-admin___opdrachten-overzicht-pagina-beschrijving'
						)}
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

export default compose(
	withRouter,
	withUser
)(AssignmentOverviewAdmin) as unknown as FunctionComponent;
