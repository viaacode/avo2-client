import {
	Button,
	ButtonGroup,
	ButtonToolbar,
	Flex,
	Form,
	FormGroup,
	Icon,
	IconName,
	MoreOptionsDropdown,
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
import { PermissionName } from '@viaa/avo2-types';
import type { Avo } from '@viaa/avo2-types';
import classnames from 'classnames';
import { cloneDeep, compact, isNil, noop } from 'lodash-es';
import React, {
	FunctionComponent,
	KeyboardEvent,
	ReactNode,
	ReactText,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Link } from 'react-router-dom';
import {
	DelimitedArrayParam,
	NumberParam,
	StringParam,
	useQueryParams,
	withDefault,
} from 'use-query-params';

import { cleanupObject } from '../../admin/shared/components/FilterTable/FilterTable.utils';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';
import {
	CheckboxDropdownModal,
	CheckboxOption,
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../shared/components';
import {
	ASSIGNMENT_OVERVIEW_BACK_BUTTON_FILTERS,
	getMoreOptionsLabel,
} from '../../shared/constants';
import { buildLink, formatDate, isMobileWidth, navigate, renderAvatar } from '../../shared/helpers';
import { renderMobileDesktop } from '../../shared/helpers/renderMobileDesktop';
import { truncateTableValue } from '../../shared/helpers/truncate';
import { useTableSort } from '../../shared/hooks';
import useTranslation from '../../shared/hooks/useTranslation';
import { AssignmentLabelsService } from '../../shared/services/assignment-labels-service';
import { ToastService } from '../../shared/services/toast-service';
import { KeyCode } from '../../shared/types';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { ITEMS_PER_PAGE } from '../../workspace/workspace.const';
import {
	ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS,
	GET_ASSIGNMENT_OVERVIEW_COLUMNS,
} from '../assignment.const';
import { AssignmentService } from '../assignment.service';
import {
	Assignment_Label_v2,
	Assignment_v2,
	Assignment_v2_With_Labels,
	AssignmentOverviewTableColumns,
	AssignmentView,
} from '../assignment.types';
import AssignmentDeadline from '../components/AssignmentDeadline';
import { deleteAssignment, deleteAssignmentWarning } from '../helpers/delete-assignment';
import { duplicateAssignment } from '../helpers/duplicate-assignment';

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
	filter: undefined,
	view: undefined,
	page: 0,
	sort_column: DEFAULT_SORT_COLUMN,
	sort_order: DEFAULT_SORT_ORDER,
};

const AssignmentOverview: FunctionComponent<AssignmentOverviewProps> = ({
	onUpdate = noop,
	history,
	user,
}) => {
	const { tText, tHtml } = useTranslation();

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [assignments, setAssignments] = useState<Assignment_v2[] | null>(null);
	const [assignmentCount, setAssigmentCount] = useState<number>(0);
	const [allAssignmentLabels, setAllAssignmentLabels] = useState<Assignment_Label_v2[]>([]);
	const [filterString, setFilterString] = useState<string | undefined>(undefined);
	const [dropdownOpenForAssignmentId, setDropdownOpenForAssignmentId] = useState<string | null>(
		null
	);
	const [isDeleteAssignmentModalOpen, setDeleteAssignmentModalOpen] = useState<boolean>(false);
	const [markedAssignment, setMarkedAssignment] = useState<Assignment_v2 | null>(null);
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
		view: withDefault(StringParam, AssignmentView.ACTIVE),
		page: NumberParam,
		sort_column: StringParam,
		sort_order: StringParam,
	});

	useEffect(() => {
		localStorage.setItem(ASSIGNMENT_OVERVIEW_BACK_BUTTON_FILTERS, JSON.stringify(query));
	}, [query]);

	useEffect(() => {
		if (query.filter) {
			setFilterString(query.filter);
		}
		if (query.sort_column) {
			setSortColumn(query.sort_column as AssignmentOverviewTableColumns);
		}
		if (query.sort_order) {
			setSortOrder(query.sort_order as Avo.Search.OrderDirection);
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

		setQuery(defaultFiltersAndSort);
	};

	const updateAndReset = async () => {
		onUpdate();
		resetFiltersAndSort();
	};

	const checkPermissions = useCallback(async () => {
		try {
			if (user) {
				setCanEditAssignments(
					await PermissionService.hasPermissions(
						[PermissionName.EDIT_ANY_ASSIGNMENTS, PermissionName.EDIT_OWN_ASSIGNMENTS],
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
				],
			});
			ToastService.danger(
				tHtml(
					'shared/components/loading-error-loaded-component/loading-error-loaded-component___er-ging-iets-mis-tijdens-het-controleren-van-de-rechten-van-je-account'
				)
			);
		}
	}, [setCanEditAssignments, user, tText]);

	const fetchAssignments = useCallback(async () => {
		try {
			if (isNil(canEditAssignments)) {
				return;
			}

			setLoadingInfo({ state: 'loading' });
			setAssignments(null);
			setAssigmentCount(0);

			const column = tableColumns.find(
				(tableColumn: any) => tableColumn.id || '' === (sortColumn as any)
			);
			const columnDataType = (column?.dataType ||
				TableColumnDataType.string) as TableColumnDataType;

			const response = await AssignmentService.fetchAssignments(
				canEditAssignments,
				user,
				query.view === AssignmentView.FINISHED, // true === past deadline
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

			setLoadingInfo({ state: 'loaded' });
		} catch (err) {
			setLoadingInfo({
				state: 'error',
				message: tText(
					'assignment/views/assignment-overview___het-ophalen-van-je-opdrachten-is-mislukt'
				),
			});
		}
	}, [
		tableColumns,
		tText,
		canEditAssignments,
		setLoadingInfo,
		query,
		sortColumn,
		sortOrder,
		user,
	]);

	const fetchAssignmentLabels = useCallback(async () => {
		if (user.profile) {
			// Fetch all labels for th current user
			const labels = await AssignmentLabelsService.getLabelsForProfile(user.profile.id);
			setAllAssignmentLabels(labels);
		}
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

	const handleSearchFieldKeyUp = (evt: KeyboardEvent<HTMLInputElement>) => {
		if (evt.keyCode === KeyCode.Enter) {
			copySearchTermsToQueryState();
		}
	};
	const handleExtraOptionsItemClicked = async (
		actionId: ExtraAssignmentOptions,
		dataRow: Assignment_v2
	) => {
		setDropdownOpenForAssignmentId(null);
		if (!dataRow.id) {
			ToastService.danger(
				tHtml(
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
					const latest: Assignment_v2 = await AssignmentService.fetchAssignmentById(
						dataRow.id as unknown as string
					);

					await duplicateAssignment(latest);
					await updateAndReset();
				} catch (err) {
					console.error('Failed to duplicate assignment', err, {
						assignmentId: dataRow.id,
					});
					ToastService.danger(
						tHtml(
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

	const renderActions = (rowData: Assignment_v2) => {
		const handleOptionClicked = async (actionId: ReactText) => {
			await handleExtraOptionsItemClicked(
				actionId.toString() as ExtraAssignmentOptions,
				rowData
			);
		};
		return (
			<ButtonToolbar className="c-assignment-overview__actions">
				{canEditAssignments && (
					<MoreOptionsDropdown
						isOpen={dropdownOpenForAssignmentId === rowData.id}
						onOpen={() => setDropdownOpenForAssignmentId(rowData.id)}
						onClose={() => setDropdownOpenForAssignmentId(null)}
						label={getMoreOptionsLabel()}
						menuItems={[
							...(query.view === AssignmentView.FINISHED
								? []
								: [
										{
											icon: 'edit-2',
											id: 'edit',
											label: tText(
												'assignment/views/assignment-overview___bewerk'
											),
										} as MenuItemInfoSchema,
								  ]),
							{
								icon: 'copy',
								id: 'duplicate',
								label: tText('assignment/views/assignment-overview___dupliceer'),
							},
							{
								icon: 'delete',
								id: 'delete',
								label: tText('assignment/views/assignment-overview___verwijder'),
							},
						]}
						onOptionClicked={handleOptionClicked}
					/>
				)}
			</ButtonToolbar>
		);
	};

	const renderLabels = (labels: { assignment_label: Assignment_Label_v2 }[], label: string) => {
		if (!labels.length) {
			return '-';
		}

		return renderMobileDesktop({
			mobile: renderDataCell(
				labels.map((label) => label.assignment_label.label).join(', '),
				label,
				'm-assignment-overview__table__data-cell--labels'
			),
			desktop: (
				<TagList
					tags={labels.map(({ assignment_label: item }: any) => ({
						id: item.id,
						label: item.label || '',
						color: item.color_override || item.enum_color?.label || 'hotpink',
					}))}
					swatches
					closable={false}
				/>
			),
		});
	};

	const renderDataCell = (value: ReactNode, label?: ReactNode, className?: string) =>
		renderMobileDesktop({
			mobile: (
				<div className={classnames('m-assignment-overview__table__data-cell', className)}>
					<div className="m-assignment-overview__table__data-cell__label">{label}</div>
					<div className="m-assignment-overview__table__data-cell__value">
						{value || '-'}
					</div>
				</div>
			),
			desktop: <span className={className}>{value || '-'}</span>,
		});

	const renderResponsesCell = (cellData: any, assignment: Assignment_v2) => {
		if ((cellData || []).length === 0) {
			return renderDataCell(
				<span
					title={tText(
						'assignment/views/assignment-overview___aantal-leerlingen-dat-de-opdracht-heeft-aangeklikt'
					)}
				>
					0
				</span>,
				tText('assignment/views/assignment-overview___responses')
			);
		}

		return renderDataCell(
			<Link to={buildLink(APP_PATH.ASSIGNMENT_RESPONSES.route, { id: assignment.id })}>
				<span
					title={tText(
						'assignment/views/assignment-overview___aantal-leerlingen-dat-de-opdracht-heeft-aangeklikt'
					)}
				>
					{(cellData || []).length}
				</span>
			</Link>,
			tText('assignment/views/assignment-overview___responses')
		);
	};

	const renderCell = (
		assignment: Assignment_v2_With_Labels,
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

		const labels = assignment.labels.filter(
			({ assignment_label: item }) => item.type === 'LABEL'
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

				return renderMobileDesktop({
					mobile: <Spacer margin="bottom-small">{renderTitle()}</Spacer>,
					desktop: renderTitle(),
				});
			}

			case 'labels':
				return renderLabels(labels, tText('assignment/views/assignment-overview___labels'));

			case 'class_room':
				return renderLabels(
					assignment.labels.filter(({ assignment_label: item }) => item.type === 'CLASS'),
					tText('assignment/views/assignment-overview___klas')
				);

			case 'author': {
				const profile = assignment?.profile || null;
				const avatarOptions = {
					dark: true,
					abbreviatedName: true,
					small: isMobileWidth(),
				};

				return renderMobileDesktop({
					mobile: null,
					desktop: renderAvatar(profile, avatarOptions),
				});
			}

			case 'deadline_at':
				return renderDataCell(
					<AssignmentDeadline deadline={assignment.deadline_at} />,
					tText('assignment/views/assignment-overview___deadline')
				);

			case 'updated_at':
				return (
					<span className="c-assignment-overview__updated-at">
						{formatDate(cellData)}
					</span>
				);

			case 'responses':
				return renderResponsesCell(cellData, assignment);

			case 'actions':
				return renderMobileDesktop({
					mobile: (
						<Spacer className="c-assignment-overview__actions" margin="top">
							{renderActions(assignment)}
						</Spacer>
					),
					desktop: renderActions(assignment),
				});

			default:
				return JSON.stringify(cellData);
		}
	};

	const getLabelOptions = (labelType: Avo.Assignment.LabelType): CheckboxOption[] => {
		return compact(
			allAssignmentLabels
				.filter((labelObj: Assignment_Label_v2) => labelObj.type === labelType)
				.map((labelObj: Assignment_Label_v2): CheckboxOption | null => {
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
			<Toolbar className="m-assignment-overview__header-toolbar">
				<ToolbarLeft>
					<ToolbarItem>
						<ButtonToolbar>
							{renderMobileDesktop({
								mobile: (
									<Select
										options={[
											{
												label: tText(
													'assignment/views/assignment-overview___actieve-opdrachten'
												),
												value: 'assignments',
											},
											{
												label: tText(
													'assignment/views/assignment-overview___afgelopen-opdrachten'
												),
												value: 'finished_assignments',
											},
										]}
										value={query.view}
										onChange={(activeViewId: string) =>
											handleQueryChanged(
												activeViewId as Avo.Assignment.View,
												'view'
											)
										}
										className="c-assignment-overview__archive-select"
										isSearchable={false}
									/>
								),
								desktop: (
									<ButtonGroup className="c-assignment-overview__archive-buttons">
										<Button
											type="secondary"
											label={tText(
												'assignment/views/assignment-overview___actieve-opdrachten'
											)}
											title={tText(
												'assignment/views/assignment-overview___filter-op-actieve-opdrachten'
											)}
											active={query.view === AssignmentView.ACTIVE}
											onClick={() =>
												handleQueryChanged(AssignmentView.ACTIVE, 'view')
											}
										/>
										<Button
											type="secondary"
											label={tText(
												'assignment/views/assignment-overview___afgelopen-opdrachten'
											)}
											title={tText(
												'assignment/views/assignment-overview___filter-op-afgelopen-opdrachten'
											)}
											active={query.view === AssignmentView.FINISHED}
											onClick={() =>
												handleQueryChanged(AssignmentView.FINISHED, 'view')
											}
										/>
									</ButtonGroup>
								),
							})}
							{canEditAssignments && (
								<>
									<CheckboxDropdownModal
										label={tText('assignment/views/assignment-overview___klas')}
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
										label={tText(
											'assignment/views/assignment-overview___label'
										)}
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
				<ToolbarRight>
					<ToolbarItem>
						<Form type="inline">
							<FormGroup inlineMode="grow">
								<TextInput
									className="c-assignment-overview__search-input"
									icon="filter"
									value={filterString}
									onChange={setFilterString}
									onKeyUp={handleSearchFieldKeyUp}
									disabled={!assignments}
								/>
							</FormGroup>
						</Form>
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
		);
	};

	const onClickCreate = () =>
		redirectToClientPage(buildLink(APP_PATH.ASSIGNMENT_CREATE.route), history);

	const getEmptyFallbackTitle = () => {
		const hasFilters: boolean =
			!!query.filter?.length ||
			!!query.selectedAssignmentLabelIds?.length ||
			!!query.selectedClassLabelIds?.length;
		if (canEditAssignments) {
			// Teacher
			if (query.view === AssignmentView.ACTIVE) {
				if (hasFilters) {
					return tText(
						'assignment/views/assignment-overview___er-zijn-geen-actieve-opdrachten-die-voldoen-aan-je-zoekterm'
					);
				}
				return tText(
					'assignment/views/assignment-overview___je-hebt-nog-geen-opdrachten-aangemaakt'
				);
			}
			if (hasFilters) {
				return tText(
					'assignment/views/assignment-overview___er-zijn-geen-verlopen-opdrachten-die-voldoen-aan-je-zoekterm'
				);
			}
			return tText(
				'assignment/views/assignment-overview___je-hebt-nog-geen-verlopen-opdrachten'
			);
		}
		// Pupil
		if (query.view === AssignmentView.ACTIVE) {
			if (hasFilters) {
				return tText(
					'assignment/views/assignment-overview___er-zijn-geen-actieve-opdrachten-die-voldoen-aan-je-zoekterm'
				);
			}
			return tText(
				'assignment/views/assignment-overview___je-hebt-nog-geen-opdrachten-ontvangen-van-je-leerkracht'
			);
		}
		if (hasFilters) {
			return tText(
				'assignment/views/assignment-overview___er-zijn-geen-verlopen-opdrachten-die-voldoen-aan-je-zoekterm'
			);
		}
		return tText('assignment/views/assignment-overview___er-zijn-nog-geen-opdrachten-verlopen');
	};

	const getEmptyFallbackDescription = () => {
		if (canEditAssignments) {
			// Teacher
			if (query.view === AssignmentView.ACTIVE) {
				return tText(
					'assignment/views/assignment-overview___beschrijving-hoe-een-opdracht-aan-te-maken'
				);
			}
			return tText(
				'assignment/views/assignment-overview___beschrijving-verlopen-opdrachten-in-werkruimte'
			);
		}
		// Pupil
		if (query.view === AssignmentView.ACTIVE) {
			return tText(
				'assignment/views/assignment-overview___beschrijving-opdrachten-in-werkruimte-voor-leerling'
			);
		}
		return tText(
			'assignment/views/assignment-overview___beschrijving-verlopen-opdrachten-in-werkruimte-voor-leerling'
		);
	};

	const getEmptyFallbackIcon = (): IconName => {
		if (canEditAssignments) {
			// Teacher
			if (query.view === AssignmentView.ACTIVE) {
				return 'clipboard';
			}
			return 'archive';
		}
		// Pupil
		if (query.view === AssignmentView.ACTIVE) {
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
							label={tText(
								'assignment/views/assignment-overview___zoek-een-fragment-of-collectie-en-maak-je-eerste-opdracht'
							)}
							onClick={onClickCreate}
						/>
					</Spacer>
				)}
			</ErrorView>
		</>
	);

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
					className="m-assignment-overview__table"
					columns={tableColumns}
					data={assignments}
					emptyStateMessage={
						query.filter
							? tText(
									'assignment/views/assignment-overview___er-zijn-geen-opdrachten-die-voldoen-aan-de-zoekopdracht'
							  )
							: query.view === AssignmentView.FINISHED
							? tText(
									'assignment/views/assignment-overview___er-zijn-nog-geen-opdrachten-gearchiveerd'
							  )
							: tText(
									'assignment/views/assignment-overview___er-zijn-nog-geen-opdrachten-aangemaakt'
							  )
					}
					renderCell={(rowData: Assignment_v2_With_Labels, colKey: string) =>
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
					title={tText(
						'assignment/views/assignment-overview___ben-je-zeker-dat-je-deze-opdracht-wil-verwijderen'
					)}
					body={deleteAssignmentWarning(markedAssignment || undefined)}
					isOpen={isDeleteAssignmentModalOpen}
					onClose={handleDeleteModalClose}
					confirmCallback={async () => {
						await deleteAssignment(markedAssignment?.id, user);

						handleDeleteModalClose();

						await updateAndReset();
						await fetchAssignments();
					}}
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
