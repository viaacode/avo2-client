import { ExportAllToCsvModal } from '@meemoo/admin-core-ui/dist/admin.mjs';
import { type Avo } from '@viaa/avo2-types';
import { first, get, isNil, noop, partition, without } from 'lodash-es';
import React, { type FC, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { type RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { AssignmentService } from '../../../assignment/assignment.service';
import { type AssignmentOverviewTableColumns } from '../../../assignment/assignment.types';
import { useGetAssignmentsEditStatuses } from '../../../assignment/hooks/useGetAssignmentsEditStatuses';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import { OrderDirection } from '../../../search/search.const';
import {
	type CheckboxOption,
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../../shared/components';
import ConfirmModal from '../../../shared/components/ConfirmModal/ConfirmModal';
import { EDIT_STATUS_REFETCH_TIME } from '../../../shared/constants';
import { Lookup_Enum_Relation_Types_Enum } from '../../../shared/generated/graphql-db-types';
import { buildLink, CustomError } from '../../../shared/helpers';
import { EducationLevelType } from '../../../shared/helpers/lom';
import { tableColumnListToCsvColumnList } from '../../../shared/helpers/table-column-list-to-csv-column-list';
import withUser, { type UserProps } from '../../../shared/hocs/withUser';
import { useLomEducationLevelsAndDegrees } from '../../../shared/hooks/useLomEducationLevelsAndDegrees';
import { useLomSubjects } from '../../../shared/hooks/useLomSubjects';
import { useQualityLabels } from '../../../shared/hooks/useQualityLabels';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { TableColumnDataType } from '../../../shared/types/table-column-data-type';
import ChangeAuthorModal from '../../shared/components/ChangeAuthorModal/ChangeAuthorModal';
import FilterTable, {
	type FilterableColumn,
	getFilters,
} from '../../shared/components/FilterTable/FilterTable';
import SubjectsBeingEditedWarningModal from '../../shared/components/SubjectsBeingEditedWarningModal/SubjectsBeingEditedWarningModal';
import {
	generateEducationLevelFilter,
	generateEducationLomFilter,
	generateLomFilter,
	getBooleanFilters,
	getDateRangeFilters,
	getMultiOptionFilters,
	NULL_FILTER,
} from '../../shared/helpers/filters';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import { AdminLayoutBody } from '../../shared/layouts/AdminLayout/AdminLayout.slots';
import { type PickerItem } from '../../shared/types';
import { useUserGroups } from '../../user-groups/hooks/useUserGroups';
import {
	GET_ASSIGNMENT_BULK_ACTIONS,
	GET_ASSIGNMENT_OVERVIEW_TABLE_COLS,
	ITEMS_PER_PAGE,
} from '../assignments.const';
import { AssignmentsBulkAction, type AssignmentsOverviewTableState } from '../assignments.types';
import {
	renderAssignmentOverviewTableCellReact,
	renderAssignmentOverviewTableCellText,
} from '../helpers/assignment-overview-render-table-cells';
import './AssignmentsOverviewAdmin.scss';

const AssignmentOverviewAdmin: FC<RouteComponentProps & UserProps> = ({ commonUser }) => {
	const { tText, tHtml } = useTranslation();

	const [assignments, setAssignments] = useState<Avo.Assignment.Assignment[] | null>(null);
	const [assignmentCount, setAssignmentCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<AssignmentsOverviewTableState>>({
		sort_column: 'created_at',
		sort_order: 'desc',
	});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isExportAllToCsvModalOpen, setIsExportAllToCsvModalOpen] = useState(false);
	const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<string[]>([]);
	const [assignmentsDeleteModalOpen, setAssignmentsDeleteModalOpen] = useState<boolean>(false);
	const [isChangeAuthorModalOpen, setIsChangeAuthorModalOpen] = useState<boolean>(false);
	const [assignmentsBeingEdited, setAssignmentsBeingEdited] = useState<Avo.Share.EditStatus[]>(
		[]
	);
	const [selectedBulkAction, setSelectedBulkAction] = useState<AssignmentsBulkAction | null>(
		null
	);
	const [qualityLabels] = useQualityLabels(true);
	const [userGroups] = useUserGroups(false);
	const [subjects] = useLomSubjects();
	const { data: educationLevelsAndDegrees } = useLomEducationLevelsAndDegrees();

	const { data: editStatuses } = useGetAssignmentsEditStatuses(
		assignments?.map((assignment) => assignment.id) || [],
		{
			enabled: !!assignments?.length,
			refetchInterval: EDIT_STATUS_REFETCH_TIME,
			refetchIntervalInBackground: true,
		}
	);

	const userGroupOptions = useMemo(
		() => [
			...userGroups.map(
				(option): CheckboxOption => ({
					id: String(option.id),
					label: option.label as string,
					checked: (tableState.author_user_group || ([] as string[])).includes(
						String(option.id)
					),
				})
			),
			{
				id: NULL_FILTER,
				label: tText('admin/collections-or-bundles/views/collection-or-bundle___geen-rol'),
				checked: (tableState.author_user_group || ([] as string[])).includes(NULL_FILTER),
			},
		],
		[tableState, userGroups, tText]
	);

	const assignmentLabelOptions = useMemo(
		() => [
			{
				id: NULL_FILTER,
				label: tText('admin/assignments/views/assignments-overview-admin___geen-label'),
				checked: (tableState.quality_labels || []).includes(NULL_FILTER),
			},
			...qualityLabels.map(
				(option): CheckboxOption => ({
					id: String(option.value),
					label: option.description,
					checked: (tableState.quality_labels || []).includes(String(option.value)),
				})
			),
		],
		[qualityLabels, tText, tableState]
	);

	const tableColumns = useMemo(
		() =>
			GET_ASSIGNMENT_OVERVIEW_TABLE_COLS(
				userGroupOptions,
				assignmentLabelOptions,
				subjects,
				educationLevelsAndDegrees || []
			),
		[userGroupOptions, assignmentLabelOptions, subjects, educationLevelsAndDegrees]
	);

	const generateWhereObject = useCallback(
		(filters: Partial<AssignmentsOverviewTableState>) => {
			const andFilters: any[] = [];

			// Text search
			if (filters.query) {
				const query = `%${filters.query}%`;

				andFilters.push({
					_or: [
						{ title: { _ilike: query } },
						{ owner: { full_name: { _ilike: query } } },
					],
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

			andFilters.push(...getBooleanFilters(filters, ['is_public']));

			// pupil collections filter: has collections, does not have collections
			if (!isNil(filters.responses?.[0]) && filters.responses?.length === 1) {
				if (filters.responses?.[0] === 'true') {
					// Assignments with pupil collections
					andFilters.push({
						responses: {},
					});
				} else {
					// Assignments without pupil collections
					andFilters.push({
						_not: {
							responses: {},
						},
					});
				}
			}

			// user group
			if (filters.author_user_group?.length) {
				const defaultGroupFilter = {
					profile: {
						profile_user_group: {
							group: {
								id: {
									_in: without(filters.author_user_group, NULL_FILTER),
								},
							},
						},
					},
				};

				const defaultNullFilter = { profile: { _not: { profile_user_groups: {} } } };

				const groupFilter = [defaultGroupFilter];
				andFilters.push({
					_or: [
						...groupFilter,
						...(filters.author_user_group.includes(NULL_FILTER)
							? [defaultNullFilter]
							: []),
					],
				});
			}

			// is copy
			const isCopy = first(get(filters, 'is_copy'));
			if (!isNil(isCopy)) {
				if (isCopy === 'true') {
					andFilters.push({
						relations: { predicate: { _eq: Lookup_Enum_Relation_Types_Enum.IsCopyOf } },
					});
				} else if (isCopy === 'false') {
					andFilters.push({
						_not: {
							relations: {
								predicate: { _eq: Lookup_Enum_Relation_Types_Enum.IsCopyOf },
							},
						},
					});
				}
			}

			// labels
			if (filters.quality_labels?.length) {
				const filterKey = 'quality_labels';

				andFilters.push({
					_or: [
						{
							[filterKey]: {
								enum_collection_label: {
									value: {
										_in: filters.quality_labels,
									},
								},
							},
						},
						...(filters.quality_labels.includes(NULL_FILTER)
							? [{ _not: { [filterKey]: {} } }]
							: []),
					],
				});
			}

			// subjects
			if (filters.subjects?.length) {
				andFilters.push(generateLomFilter(filters.subjects, EducationLevelType.vak));
			}

			// // Enable when meemoo requests a column and folder for lom themes
			// if (filters.themes && filters.themes.length) {
			// 	andFilters.push(
			// 		generateLomFilter(filters.themes, EducationLevelType.thema)
			// 	);
			// }

			// Education levels
			if (filters.education_levels && filters.education_levels.length) {
				andFilters.push(
					generateEducationLomFilter(
						filters.education_levels,
						(educationLevelsAndDegrees || [])
							.filter((item) => !item.broader)
							.map((item) => item.id)
					)
				);
			}

			// Education degrees
			if (filters.education_degrees?.length) {
				andFilters.push(
					generateEducationLomFilter(
						filters.education_degrees,
						(educationLevelsAndDegrees || [])
							.filter((item) => !!item.broader)
							.map((item) => item.id)
					)
				);
			}

			if (filters.education_level_id) {
				andFilters.push(
					generateEducationLevelFilter(
						filters.education_level_id,
						EducationLevelType.structuur
					)
				);
			}

			return { _and: andFilters };
		},
		[educationLevelsAndDegrees]
	);

	const getColumnDataType = useCallback(() => {
		const column = tableColumns.find((tableColumn: FilterableColumn) => {
			return tableColumn.id === (tableState.sort_column || 'empty');
		});
		return (column?.dataType || TableColumnDataType.string) as TableColumnDataType;
	}, [tableColumns, tableState.sort_column]);

	const fetchAssignments = useCallback(async () => {
		try {
			setIsLoading(true);
			const [assignmentsTemp, assignmentCountTemp] =
				await AssignmentService.fetchAssignmentsForAdmin(
					(tableState.page || 0) * ITEMS_PER_PAGE,
					ITEMS_PER_PAGE,
					(tableState.sort_column || 'created_at') as AssignmentOverviewTableColumns,
					tableState.sort_order || 'desc',
					getColumnDataType(),
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
	}, [tableState, getColumnDataType, generateWhereObject, tHtml]);

	useEffect(() => {
		if (commonUser && educationLevelsAndDegrees?.length) {
			fetchAssignments().then(noop);
		}
	}, [commonUser, educationLevelsAndDegrees?.length, fetchAssignments]);

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
		if (action === AssignmentsBulkAction.EXPORT_ALL) {
			// No rows need to be selected since we export everything
			// We also don't need to check any edit statuses since we're not editing/deleting anything
			setIsExportAllToCsvModalOpen(true);
			return;
		}

		if (selectedAssignmentIds.length === 0) {
			return; // No rows selected, and actions below need selected rows to perform their operations
		}

		const selectedAssignmentEditStatuses =
			await AssignmentService.getAssignmentsEditStatuses(selectedAssignmentIds);
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
				case AssignmentsBulkAction.DELETE:
					setAssignmentsDeleteModalOpen(true);
					return;

				case AssignmentsBulkAction.CHANGE_AUTHOR:
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
					columns={tableColumns}
					data={assignments}
					dataCount={assignmentCount}
					renderCell={(rowData: Partial<Avo.Assignment.Assignment>, columnId: string) =>
						renderAssignmentOverviewTableCellReact(
							rowData,
							columnId as AssignmentOverviewTableColumns,
							{
								editStatuses,
								commonUser: commonUser as Avo.User.CommonUser,
							}
						)
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
					onSelectionChanged={setSelectedAssignmentIds as (ids: ReactNode[]) => void}
					onSelectAll={setAllAssignmentsAsSelected}
					bulkActions={GET_ASSIGNMENT_BULK_ACTIONS(
						commonUser,
						selectedAssignmentIds.length > 0
					)}
					onSelectBulkAction={handleBulkAction as any}
					rowKey="id"
					defaultOrderProp={'created_at'}
					defaultOrderDirection={OrderDirection.desc}
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
				<ExportAllToCsvModal
					title={tText(
						'admin/assignments/views/assignments-overview-admin___exporteren-van-alle-opdrachten-naar-csv'
					)}
					isOpen={isExportAllToCsvModalOpen}
					onClose={() => setIsExportAllToCsvModalOpen(false)}
					fetchingItemsLabel={tText(
						'admin/assignments/views/assignments-overview-admin___bezig-met-ophalen-van-opdrachten'
					)}
					generatingCsvLabel={tText(
						'admin/assignments/views/assignments-overview-admin___bezig-met-genereren-van-de-csv'
					)}
					fetchTotalItems={async () => {
						const response = await AssignmentService.fetchAssignmentsForAdmin(
							0,
							0,
							(tableState.sort_column ||
								'created_at') as AssignmentOverviewTableColumns,
							tableState.sort_order || 'desc',
							getColumnDataType(),
							{}
						);
						return response[1];
					}}
					fetchMoreItems={async (offset: number, limit: number) => {
						const response = await AssignmentService.fetchAssignmentsForAdmin(
							offset,
							limit,
							(tableState.sort_column ||
								'created_at') as AssignmentOverviewTableColumns,
							tableState.sort_order || 'desc',
							getColumnDataType(),
							{}
						);
						return response[0];
					}}
					renderValue={(value: any, columnId: string) =>
						renderAssignmentOverviewTableCellText(
							value as any,
							columnId as AssignmentOverviewTableColumns
						)
					}
					columns={tableColumnListToCsvColumnList(tableColumns)}
					exportFileName={tText(
						'admin/assignments/views/assignments-overview-admin___opdrachten-csv'
					)}
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
				<Helmet>
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
				</Helmet>
				<LoadingErrorLoadedComponent
					loadingInfo={loadingInfo}
					dataObject={assignments}
					render={renderAssignmentOverview}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default compose(withRouter, withUser)(AssignmentOverviewAdmin) as unknown as FC;
