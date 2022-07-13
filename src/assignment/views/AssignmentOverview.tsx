import {
	Button,
	ButtonGroup,
	ButtonToolbar,
	Flex,
	Form,
	FormGroup,
	Icon,
	IconName,
	Pagination,
	Select,
	Spacer,
	Table,
	TagList,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	useKeyPress,
} from '@viaa/avo2-components';
import { MenuItemInfoSchema } from '@viaa/avo2-components/src/components/Menu/MenuContent/MenuContent';
import { Avo } from '@viaa/avo2-types';
import { AssignmentLabelType, AssignmentSchema_v2 } from '@viaa/avo2-types/types/assignment';
import { SearchOrderDirection } from '@viaa/avo2-types/types/search';
import classnames from 'classnames';
import { cloneDeep, compact, get, isEqual, isNil, noop } from 'lodash-es';
import React, {
	FunctionComponent,
	ReactNode,
	ReactText,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DelimitedArrayParam, NumberParam, StringParam, useQueryParams } from 'use-query-params';

import { cleanupObject } from '../../admin/shared/components/FilterTable/FilterTable.utils';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';
import {
	CheckboxDropdownModal,
	CheckboxOption,
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../shared/components';
import MoreOptionsDropdown from '../../shared/components/MoreOptionsDropdown/MoreOptionsDropdown';
import { ASSIGNMENT_OVERVIEW_BACK_BUTTON_FILTERS } from '../../shared/constants';
import {
	buildLink,
	CustomError,
	formatDate,
	isMobileWidth,
	navigate,
	renderAvatar,
} from '../../shared/helpers';
import { truncateTableValue } from '../../shared/helpers/truncate';
import { useTableSort } from '../../shared/hooks';
import { AssignmentLabelsService, ToastService } from '../../shared/services';
import { trackEvents } from '../../shared/services/event-logging-service';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { ITEMS_PER_PAGE } from '../../workspace/workspace.const';
import {
	ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS,
	GET_ASSIGNMENT_OVERVIEW_COLUMNS,
} from '../assignment.const';
import { AssignmentService } from '../assignment.service';
import {
	AssignmentOverviewTableColumns,
	AssignmentType,
	AssignmentView,
} from '../assignment.types';
import AssignmentDeadline from '../components/AssignmentDeadline';

import './AssignmentOverview.scss';

type ExtraAssignmentOptions = 'edit' | 'duplicate' | 'archive' | 'delete';

interface AssignmentOverviewProps extends DefaultSecureRouteProps {
	onUpdate: () => void | Promise<void>;
}

const DEFAULT_SORT_COLUMN = 'updated_at';
const DEFAULT_SORT_ORDER = 'desc';

const defaultFiltersAndSort = {
	selectedAssignmentLabelIds: [],
	selectedClassLabelsIds: [],
	filter: '',
	view: AssignmentView.ACTIVE,
	page: 0,
	sort_column: DEFAULT_SORT_COLUMN,
	sort_order: DEFAULT_SORT_ORDER,
};

const AssignmentOverview: FunctionComponent<AssignmentOverviewProps> = ({
	onUpdate = noop,
	history,
	user,
}) => {
	const [t] = useTranslation();

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [assignments, setAssignments] = useState<Avo.Assignment.Assignment_v2[] | null>(null);
	const [assignmentCount, setAssigmentCount] = useState<number>(0);
	const [allAssignmentLabels, setAllAssignmentLabels] = useState<Avo.Assignment.Label_v2[]>([]);
	const [filterString, setFilterString] = useState<string>('');
	const [dropdownOpenForAssignmentId, setDropdownOpenForAssignmentId] = useState<string | null>(
		null
	);
	const [isDeleteAssignmentModalOpen, setDeleteAssignmentModalOpen] = useState<boolean>(false);
	const [markedAssignment, setMarkedAssignment] = useState<Avo.Assignment.Assignment_v2 | null>(
		null
	);
	const [canEditAssignments, setCanEditAssignments] = useState<boolean | null>(null);

	const [sortColumn, sortOrder, handleColumnClick, setSortColumn, setSortOrder] =
		useTableSort<AssignmentOverviewTableColumns>(DEFAULT_SORT_COLUMN);

	const tableColumns = useMemo(
		() => GET_ASSIGNMENT_OVERVIEW_COLUMNS(canEditAssignments),
		[canEditAssignments]
	);

	const [query, setQuery] = useQueryParams({
		selectedAssignmentLabelIds: DelimitedArrayParam,
		selectedClassLabelIds: DelimitedArrayParam,
		filter: StringParam,
		view: StringParam,
		page: NumberParam,
		sort_column: StringParam,
		sort_order: StringParam,
	});

	useEffect(() => {
		localStorage.setItem(ASSIGNMENT_OVERVIEW_BACK_BUTTON_FILTERS, JSON.stringify(query));
	}, [query]);

	// Init values
	const activeView = query.view || AssignmentView.ACTIVE;

	useEffect(() => {
		if (query.filter) {
			setFilterString(query.filter);
		}
		if (query.sort_column) {
			setSortColumn(query.sort_column as AssignmentOverviewTableColumns);
		}
		if (query.sort_order) {
			setSortOrder(query.sort_order as SearchOrderDirection);
		}
	}, []);

	const handleQueryChanged = (value: any, id: string) => {
		let newQuery: any = cloneDeep(query);

		newQuery = {
			...newQuery,
			[id]: value,
			...(id !== 'page' ? { page: 0 } : {}), // Reset the page to 0, when any filter or sort order change is made
		};

		setQuery(newQuery, 'pushIn');
	};

	const copySearchTermsToQueryState = () => {
		handleQueryChanged(filterString, 'filter');
	};
	useKeyPress('Enter', copySearchTermsToQueryState);

	const handleSortOrderChange = (columnId: string) => {
		const { sortColumn: newSortColumn, sortOrder: newSortOrder } = handleColumnClick(
			columnId as AssignmentOverviewTableColumns
		);

		let newQuery: any = cloneDeep(query);

		newQuery = cleanupObject({
			...newQuery,
			sort_column: newSortColumn,
			sort_order: newSortOrder,
		});

		setQuery(newQuery, 'pushIn');
	};

	const resetFiltersAndSort = () => {
		setFilterString('');
		setSortColumn(DEFAULT_SORT_COLUMN);
		setSortOrder(DEFAULT_SORT_ORDER);

		setQuery(defaultFiltersAndSort, 'pushIn');
	};

	const checkPermissions = useCallback(async () => {
		try {
			if (user) {
				setCanEditAssignments(
					await PermissionService.hasPermissions(
						[
							PermissionName.EDIT_ANY_ASSIGNMENTS,
							PermissionName.EDIT_OWN_ASSIGNMENTS,
							PermissionName.EDIT_ASSIGNMENTS,
						],
						user
					)
				);
			}
		} catch (err) {
			console.error('Failed to check permissions', err, {
				user,
				permissions: [
					PermissionName.EDIT_ANY_ASSIGNMENTS,
					PermissionName.EDIT_OWN_ASSIGNMENTS,
					PermissionName.EDIT_ASSIGNMENTS,
				],
			});
			ToastService.danger(
				t(
					'shared/components/loading-error-loaded-component/loading-error-loaded-component___er-ging-iets-mis-tijdens-het-controleren-van-de-rechten-van-je-account'
				)
			);
		}
	}, [setCanEditAssignments, user, t]);

	const fetchAssignments = useCallback(async () => {
		try {
			if (isNil(canEditAssignments)) {
				return;
			}

			const column = tableColumns.find(
				(tableColumn: any) => tableColumn.id || '' === (sortColumn as any)
			);
			const columnDataType = (column?.dataType ||
				TableColumnDataType.string) as TableColumnDataType;

			const response = await AssignmentService.fetchAssignments(
				canEditAssignments,
				user,
				activeView === AssignmentView.FINISHED, // true === past deadline
				sortColumn,
				sortOrder,
				columnDataType,
				query.page || 0,
				query.filter || '',
				(query.selectedAssignmentLabelIds as string[]) || [],
				(query.selectedClassLabelIds as string[]) || []
			);

			setAssignments(response.assignments);
			setAssigmentCount(response.count);
		} catch (err) {
			setLoadingInfo({
				state: 'error',
				message: t(
					'assignment/views/assignment-overview___het-ophalen-van-je-opdrachten-is-mislukt'
				),
			});
		}
	}, [
		tableColumns,
		t,
		canEditAssignments,
		setLoadingInfo,
		query,
		activeView,
		sortColumn,
		sortOrder,
		user,
	]);

	const fetchAssignmentLabels = useCallback(async () => {
		// Fetch all labels for th current user
		const labels = await AssignmentLabelsService.getLabelsForProfile(get(user, 'profile.id'));
		setAllAssignmentLabels(labels);
	}, [user, setAllAssignmentLabels]);

	useEffect(() => {
		checkPermissions();
	}, [checkPermissions]);

	useEffect(() => {
		if (!isNil(canEditAssignments)) {
			fetchAssignments();
			fetchAssignmentLabels();
		}
	}, [canEditAssignments, fetchAssignments, fetchAssignmentLabels]);

	useEffect(() => {
		if (!isNil(assignments) && !isNil(assignmentCount)) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [assignments, assignmentCount]);

	const duplicateAssignment = async (
		assignment: Partial<Avo.Assignment.Assignment_v2> | null
	) => {
		try {
			if (!assignment) {
				throw new CustomError(
					'Failed to duplicate the assignment because the marked assignment is null'
				);
			}
			const newTitle = `${t('assignment/views/assignment-overview___kopie')} ${
				assignment.title
			}`;
			await AssignmentService.duplicateAssignment(newTitle, assignment);

			onUpdate();
			if (isEqual(defaultFiltersAndSort, query)) {
				fetchAssignments();
			} else {
				resetFiltersAndSort(); // This will trigger the fetchAssignments
			}

			ToastService.success(
				t('assignment/views/assignment-overview___het-dupliceren-van-de-opdracht-is-gelukt')
			);
		} catch (err) {
			console.error('Failed to copy the assignment', err, { assignment });
			ToastService.danger(
				t('assignment/views/assignment-edit___het-kopieren-van-de-opdracht-is-mislukt')
			);
		}
	};

	const deleteCurrentAssignment = async (assignmentId: string | null) => {
		try {
			if (isNil(assignmentId)) {
				ToastService.danger(
					t(
						'assignment/views/assignment-overview___de-huidige-opdracht-is-nog-nooit-opgeslagen-geen-id'
					)
				);
				return;
			}
			await AssignmentService.deleteAssignment(assignmentId);

			trackEvents(
				{
					object: assignmentId,
					object_type: 'assignment',
					action: 'delete',
				},
				user
			);

			await fetchAssignments();
			onUpdate();
			ToastService.success(
				t('assignment/views/assignment-overview___de-opdracht-is-verwijdert')
			);
		} catch (err) {
			console.error(err);
			ToastService.danger(
				t(
					'assignment/views/assignment-overview___het-verwijderen-van-de-opdracht-is-mislukt'
				)
			);
		}
	};

	const handleExtraOptionsItemClicked = async (
		actionId: ExtraAssignmentOptions,
		dataRow: Avo.Assignment.Assignment_v2
	) => {
		setDropdownOpenForAssignmentId(null);
		if (!dataRow.id) {
			ToastService.danger(
				t(
					'assignment/views/assignment-overview___het-opdracht-id-van-de-geselecteerde-rij-is-niet-ingesteld'
				)
			);
			return;
		}
		switch (actionId) {
			case 'edit':
				navigate(history, APP_PATH.ASSIGNMENT_EDIT.route, { id: dataRow.id });
				break;
			case 'duplicate':
				try {
					const assignment: Avo.Assignment.Assignment_v2 =
						await AssignmentService.fetchAssignmentById(
							dataRow.id as unknown as string
						);

					await duplicateAssignment(assignment);
				} catch (err) {
					console.error('Failed to duplicate assignment', err, {
						assignmentId: dataRow.id,
					});
					ToastService.danger(
						t(
							'assignment/views/assignment-overview___het-ophalen-van-de-details-van-de-opdracht-is-mislukt'
						)
					);
				}
				break;

			case 'delete':
				setMarkedAssignment(dataRow);
				setDeleteAssignmentModalOpen(true);
				break;
			default:
				return null;
		}
	};

	const handleDeleteModalClose = () => {
		setDeleteAssignmentModalOpen(false);
		setMarkedAssignment(null);
	};

	const renderActions = (rowData: Avo.Assignment.Assignment_v2) => {
		return (
			<ButtonToolbar>
				{canEditAssignments && (
					<MoreOptionsDropdown
						isOpen={dropdownOpenForAssignmentId === rowData.id}
						onOpen={() => setDropdownOpenForAssignmentId(rowData.id)}
						onClose={() => setDropdownOpenForAssignmentId(null)}
						menuItems={[
							...(activeView === AssignmentView.FINISHED
								? []
								: [
										{
											icon: 'edit-2',
											id: 'edit',
											label: t(
												'assignment/views/assignment-overview___bewerk'
											),
										} as MenuItemInfoSchema,
								  ]),
							{
								icon: 'copy',
								id: 'duplicate',
								label: t('assignment/views/assignment-overview___dupliceer'),
							},
							{
								icon: 'delete',
								id: 'delete',
								label: t('assignment/views/assignment-overview___verwijder'),
							},
						]}
						onOptionClicked={(actionId: ReactText) =>
							handleExtraOptionsItemClicked(
								actionId.toString() as ExtraAssignmentOptions,
								rowData
							)
						}
					/>
				)}
			</ButtonToolbar>
		);
	};

	const renderLabels = (labels: Avo.Assignment.Label_v2[]) => (
		<TagList
			tags={(labels as any).map(({ assignment_label: item }: any) => ({
				// TODO make types stricter
				id: item.id,
				label: item.label || '',
				color: item.color_override || item.enum_color?.label || 'hotpink',
			}))}
			swatches
			closable={false}
		/>
	);

	const renderDataCell = (value: ReactNode, label?: ReactNode) =>
		isMobileWidth() ? (
			<div className="m-assignment-overview__table__data-cell">
				<div className="m-assignment-overview__table__data-cell__label">{label}</div>
				<div className="m-assignment-overview__table__data-cell__value">{value}</div>
			</div>
		) : (
			value
		);

	const renderResponsesCell = (cellData: any, assignment: AssignmentSchema_v2) => {
		if ((cellData || []).length === 0) {
			return renderDataCell('0', t('assignment/views/assignment-overview___responses'));
		}

		return renderDataCell(
			<Link to={buildLink(APP_PATH.ASSIGNMENT_RESPONSES.route, { id: assignment.id })}>
				{(cellData || []).length}
			</Link>,
			t('assignment/views/assignment-overview___responses')
		);
	};

	const renderCell = (
		assignment: Avo.Assignment.Assignment_v2,
		colKey: AssignmentOverviewTableColumns
	) => {
		const cellData: any = (assignment as any)[colKey];
		const editLink = buildLink(APP_PATH.ASSIGNMENT_EDIT.route, { id: assignment.id });
		const detailLink = buildLink(
			APP_PATH.ASSIGNMENT_RESPONSE_DETAIL.route,
			{
				id: assignment.id,
			},
			{ tab: ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.ASSIGNMENT }
		);

		switch (
			colKey as any // TODO remove cast once assignment_v2 types are fixed (labels, class_room, author)
		) {
			case 'title': {
				const renderTitle = () => (
					<Flex>
						<Spacer margin="right">
							<Icon name="clipboard" subtle />
						</Spacer>
						<div className="c-content-header c-content-header--small">
							<h3 className="c-content-header__header u-m-0">
								<Link to={canEditAssignments ? editLink : detailLink}>
									{truncateTableValue(assignment.title)}
								</Link>
							</h3>
						</div>
					</Flex>
				);

				return isMobileWidth() ? (
					<Spacer margin="bottom-small">{renderTitle()}</Spacer>
				) : (
					renderTitle()
				);
			}

			case 'labels':
				return renderLabels(
					(assignment.labels as any[]).filter(
						({ assignment_label: item }) => item.type === 'LABEL'
					)
				);

			case 'class_room':
				return renderLabels(
					(assignment.labels as any[]).filter(
						({ assignment_label: item }) => item.type === 'CLASS'
					)
				);

			case 'author': {
				const profile = get(assignment, 'profile', null);
				const avatarOptions = {
					dark: true,
					abbreviatedName: true,
					small: isMobileWidth(),
				};

				return isMobileWidth() ? (
					<Spacer margin="bottom-small">{renderAvatar(profile, avatarOptions)}</Spacer>
				) : (
					renderAvatar(profile, avatarOptions)
				);
			}

			case 'deadline_at':
				return renderDataCell(
					<AssignmentDeadline deadline={assignment.deadline_at} />,
					t('assignment/views/assignment-overview___deadline')
				);

			case 'updated_at':
				return formatDate(cellData);

			case 'responses':
				return renderResponsesCell(cellData, assignment);

			case 'actions':
				if (isMobileWidth()) {
					return <Spacer margin="top">{renderActions(assignment)}</Spacer>;
				}
				return renderActions(assignment);

			default:
				return JSON.stringify(cellData);
		}
	};

	const getLabelOptions = (labelType: AssignmentLabelType): CheckboxOption[] => {
		return compact(
			allAssignmentLabels
				.filter((labelObj: Avo.Assignment.Label_v2) => labelObj.type === labelType)
				.map((labelObj: Avo.Assignment.Label_v2): CheckboxOption | null => {
					if (!labelObj.label) {
						return null;
					}
					return {
						label: labelObj.label,
						id: labelObj.id,
						checked: [
							...(query.selectedAssignmentLabelIds || []),
							...(query.selectedClassLabelIds || []),
						].includes(labelObj.id),
					};
				})
		);
	};

	const renderHeader = () => {
		return (
			<Toolbar
				className={classnames('m-assignment-overview__header-toolbar', {
					'm-assignment-overview__header-toolbar-mobile': isMobileWidth(),
				})}
			>
				<ToolbarLeft>
					<ToolbarItem>
						<ButtonToolbar>
							{isMobileWidth() ? (
								<Select
									options={[
										{
											label: t(
												'assignment/views/assignment-overview___actieve-opdrachten'
											),
											value: 'assignments',
										},
										{
											label: t(
												'assignment/views/assignment-overview___afgelopen-opdrachten'
											),
											value: 'finished_assignments',
										},
									]}
									value={activeView}
									onChange={(activeViewId: string) =>
										handleQueryChanged(
											activeViewId as Avo.Assignment.View,
											'view'
										)
									}
									className="c-assignment-overview__archive-select"
								/>
							) : (
								<ButtonGroup className="c-assignment-overview__archive-buttons">
									<Button
										type="secondary"
										label={t(
											'assignment/views/assignment-overview___actieve-opdrachten'
										)}
										title={t(
											'assignment/views/assignment-overview___filter-op-actieve-opdrachten'
										)}
										active={activeView === AssignmentView.ACTIVE}
										onClick={() =>
											handleQueryChanged(AssignmentView.ACTIVE, 'view')
										}
									/>
									<Button
										type="secondary"
										label={t(
											'assignment/views/assignment-overview___afgelopen-opdrachten'
										)}
										title={t(
											'assignment/views/assignment-overview___filter-op-afgelopen-opdrachten'
										)}
										active={activeView === AssignmentView.FINISHED}
										onClick={() =>
											handleQueryChanged(AssignmentView.FINISHED, 'view')
										}
									/>
								</ButtonGroup>
							)}
							{canEditAssignments && (
								<>
									<CheckboxDropdownModal
										label={t('assignment/views/assignment-overview___klas')}
										id="Klas"
										options={getLabelOptions('CLASS')}
										onChange={(selectedClasses) =>
											handleQueryChanged(
												selectedClasses,
												'selectedClassLabelIds'
											)
										}
									/>
									<CheckboxDropdownModal
										label={t('assignment/views/assignment-overview___label')}
										id="Label"
										options={getLabelOptions('LABEL')}
										onChange={(selectedLabels) =>
											handleQueryChanged(
												selectedLabels,
												'selectedAssignmentLabelIds'
											)
										}
									/>
								</>
							)}
						</ButtonToolbar>
					</ToolbarItem>
				</ToolbarLeft>
				{canEditAssignments && (
					<ToolbarRight>
						<ToolbarItem>
							<Form type="inline">
								<FormGroup inlineMode="grow">
									<TextInput
										className="c-assignment-overview__search-input"
										icon="filter"
										value={filterString}
										onChange={setFilterString}
										disabled={!assignments}
									/>
								</FormGroup>
								<FormGroup inlineMode="grow">
									<Button
										label={t('search/views/search___zoeken')}
										type="primary"
										className="c-assignment-overview__search-input"
										onClick={copySearchTermsToQueryState}
									/>
								</FormGroup>
							</Form>
						</ToolbarItem>
					</ToolbarRight>
				)}
			</Toolbar>
		);
	};

	const onClickCreate = () => history.push(buildLink(APP_PATH.SEARCH.route));

	const getEmptyFallbackTitle = () => {
		const hasFilters: boolean =
			!!query.filter?.length ||
			!!query.selectedAssignmentLabelIds?.length ||
			!!query.selectedClassLabelIds?.length;
		if (canEditAssignments) {
			// Teacher
			if (activeView === AssignmentView.ACTIVE) {
				if (hasFilters) {
					return t(
						'assignment/views/assignment-overview___er-zijn-geen-actieve-opdrachten-die-voldoen-aan-je-zoekterm'
					);
				}
				return t(
					'assignment/views/assignment-overview___je-hebt-nog-geen-opdrachten-aangemaakt'
				);
			}
			if (hasFilters) {
				return t(
					'assignment/views/assignment-overview___er-zijn-geen-verlopen-opdrachten-die-voldoen-aan-je-zoekterm'
				);
			}
			return t('assignment/views/assignment-overview___je-hebt-nog-geen-verlopen-opdrachten');
		}
		// Pupil
		if (activeView === AssignmentView.ACTIVE) {
			return t(
				'assignment/views/assignment-overview___je-hebt-nog-geen-opdrachten-ontvangen-van-je-leerkracht'
			);
		}
		return t('assignment/views/assignment-overview___er-zijn-nog-geen-opdrachten-verlopen');
	};

	const getEmptyFallbackDescription = () => {
		if (canEditAssignments) {
			// Teacher
			if (activeView === AssignmentView.ACTIVE) {
				return t(
					'assignment/views/assignment-overview___beschrijving-hoe-een-opdracht-aan-te-maken'
				);
			}
			return t(
				'assignment/views/assignment-overview___beschrijving-verlopen-opdrachten-in-werkruimte'
			);
		}
		// Pupil
		if (activeView === AssignmentView.ACTIVE) {
			return t(
				'assignment/views/assignment-overview___beschrijving-opdrachten-in-werkruimte-voor-leerling'
			);
		}
		return t(
			'assignment/views/assignment-overview___beschrijving-verlopen-opdrachten-in-werkruimte-voor-leerling'
		);
	};

	const getEmptyFallbackIcon = (): IconName => {
		if (canEditAssignments) {
			// Teacher
			if (activeView === AssignmentView.ACTIVE) {
				return 'clipboard';
			}
			return 'archive';
		}
		// Pupil
		if (activeView === AssignmentView.ACTIVE) {
			return 'clipboard';
		}
		return 'clock';
	};

	const renderEmptyFallback = () => (
		<>
			{renderHeader()}
			<ErrorView icon={getEmptyFallbackIcon()} message={getEmptyFallbackTitle()}>
				<p>{getEmptyFallbackDescription()}</p>
				{canEditAssignments && (
					<Spacer margin="top">
						<Button
							type="primary"
							icon="search"
							label={t(
								'assignment/views/assignment-overview___zoek-een-fragment-of-collectie-en-maak-je-eerste-opdracht'
							)}
							onClick={onClickCreate}
						/>
					</Spacer>
				)}
			</ErrorView>
		</>
	);

	const getDeleteModalBody = () => {
		if (markedAssignment?.assignment_type === AssignmentType.BOUW) {
			return t(
				'assignment/views/assignment-overview___deze-opdracht-bevat-mogelijk-collecties-die-eveneens-verwijderd-zullen-worden'
			);
		}
		if (markedAssignment?.responses?.length) {
			return t(
				'assignment/views/assignment-overview___leerlingen-bekeken-deze-opdracht-reeds'
			);
		}
		return t(
			'assignment/views/assignment-overview___deze-actie-kan-niet-ongedaan-gemaakt-worden'
		);
	};

	const renderAssignmentsView = () => {
		if (!assignments) {
			return null;
		}
		if (!assignments.length) {
			return renderEmptyFallback();
		}
		return (
			<>
				{renderHeader()}
				<Table
					className={classnames('m-assignment-overview__table', {
						'm-assignment-overview__table-mobile': isMobileWidth(),
					})}
					columns={tableColumns}
					data={assignments}
					emptyStateMessage={
						query.filter
							? t(
									'assignment/views/assignment-overview___er-zijn-geen-opdrachten-die-voldoen-aan-de-zoekopdracht'
							  )
							: activeView === AssignmentView.FINISHED
							? t(
									'assignment/views/assignment-overview___er-zijn-nog-geen-opdrachten-gearchiveerd'
							  )
							: t(
									'assignment/views/assignment-overview___er-zijn-nog-geen-opdrachten-aangemaakt'
							  )
					}
					renderCell={(rowData: Avo.Assignment.Assignment_v2, colKey: string) =>
						renderCell(rowData, colKey as AssignmentOverviewTableColumns)
					}
					rowKey="id"
					variant="styled"
					onColumnClick={handleSortOrderChange}
					sortColumn={sortColumn}
					sortOrder={sortOrder}
					useCards={isMobileWidth()}
				/>
				<Spacer margin="top-large">
					<Pagination
						pageCount={Math.ceil(assignmentCount / ITEMS_PER_PAGE)}
						currentPage={query.page || 0}
						onPageChange={(newPage: number) => handleQueryChanged(newPage, 'page')}
					/>
				</Spacer>

				<DeleteObjectModal
					title={t(
						'assignment/views/assignment-overview___ben-je-zeker-dat-je-deze-opdracht-wil-verwijderen'
					)}
					body={getDeleteModalBody()}
					isOpen={isDeleteAssignmentModalOpen}
					onClose={handleDeleteModalClose}
					deleteObjectCallback={() =>
						deleteCurrentAssignment(get(markedAssignment, 'id', null))
					}
				/>
			</>
		);
	};

	return canEditAssignments !== null ? (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={assignments}
			render={renderAssignmentsView}
		/>
	) : null;
};

export default AssignmentOverview;
