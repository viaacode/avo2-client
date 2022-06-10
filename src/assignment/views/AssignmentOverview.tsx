import classnames from 'classnames';
import { capitalize, compact, get, isNil } from 'lodash-es';
import React, {
	FunctionComponent,
	ReactText,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

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
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';
import {
	CheckboxDropdownModal,
	CheckboxOption,
	DeleteObjectModal,
	InputModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../shared/components';
import MoreOptionsDropdown from '../../shared/components/MoreOptionsDropdown/MoreOptionsDropdown';
import {
	buildLink,
	CustomError,
	formatDate,
	formatTimestamp,
	isMobileWidth,
	navigate,
	renderAvatar,
} from '../../shared/helpers';
import { truncateTableValue } from '../../shared/helpers/truncate';
import { useTableSort } from '../../shared/hooks';
import { AssignmentLabelsService, ToastService } from '../../shared/services';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ITEMS_PER_PAGE } from '../../workspace/workspace.const';
import { GET_ASSIGNMENT_OVERVIEW_COLUMNS } from '../assignment.const';
import { AssignmentHelper } from '../assignment.helper';
import { AssignmentService } from '../assignment.service';
import {
	AssignmentLabelType,
	AssignmentOverviewTableColumns,
	AssignmentView,
} from '../assignment.types';

import './AssignmentOverview.scss';

type ExtraAssignmentOptions = 'edit' | 'duplicate' | 'archive' | 'delete';

interface AssignmentOverviewProps extends DefaultSecureRouteProps {
	onUpdate: () => void | Promise<void>;
}

const AssignmentOverview: FunctionComponent<AssignmentOverviewProps> = ({
	onUpdate = () => {},
	history,
	user,
}) => {
	const [t] = useTranslation();

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [assignments, setAssignments] = useState<Avo.Assignment.Assignment[] | null>(null);
	const [assignmentCount, setAssigmentCount] = useState<number>(0);
	const [allAssignmentLabels, setAllAssignmentLabels] = useState<Avo.Assignment.Label_v2[]>([]);
	const [selectedAssignmentLabelsIds, setSelectedAssignmentLabelsIds] = useState<string[]>([]);
	const [selectedClassLabelsIds, setSelectedClassLabelsIds] = useState<string[]>([]);
	const [filterString, setFilterString] = useState<string>('');
	const [activeView, setActiveView] = useState<Avo.Assignment.View>('assignments');
	const [dropdownOpenForAssignmentId, setDropdownOpenForAssignmentId] = useState<string | null>(
		null
	);
	const [isDuplicateAssignmentModalOpen, setDuplicateAssignmentModalOpen] = useState<boolean>(
		false
	);
	const [isDeleteAssignmentModalOpen, setDeleteAssignmentModalOpen] = useState<boolean>(false);
	const [markedAssignment, setMarkedAssignment] = useState<Avo.Assignment.Assignment_v2 | null>(
		null
	);
	const [page, setPage] = useState<number>(0);
	const [canEditAssignments, setCanEditAssignments] = useState<boolean | null>(null);

	const [sortColumn, sortOrder, handleColumnClick] = useTableSort<AssignmentOverviewTableColumns>(
		'created_at'
	);

	const tableColumns = useMemo(() => GET_ASSIGNMENT_OVERVIEW_COLUMNS(canEditAssignments), [
		canEditAssignments,
	]);

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
			const columnDataType: string = get(column, 'dataType', '');

			const response = await AssignmentService.fetchAssignments(
				canEditAssignments,
				user,
				activeView === AssignmentView.FINISHED, // true === past deadline
				sortColumn,
				sortOrder,
				columnDataType,
				page,
				filterString,
				selectedAssignmentLabelsIds,
				selectedClassLabelsIds
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
		activeView,
		canEditAssignments,
		setLoadingInfo,
		filterString,
		selectedClassLabelsIds,
		selectedAssignmentLabelsIds,
		page,
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

	const attemptDuplicateAssignment = async (
		newTitle: string,
		assignment: Partial<Avo.Assignment.Assignment_v2> | null
	) => {
		try {
			if (!assignment) {
				throw new CustomError(
					'Failed to duplicate the assignment because the marked assignment is null'
				);
			}
			await AssignmentService.duplicateAssignment(newTitle, assignment);

			onUpdate();
			fetchAssignments();

			ToastService.success(
				t('assignment/views/assignment-overview___het-dupliceren-van-de-opdracht-is-gelukt')
			);
		} catch (err) {
			console.error('Failed to copy the assignment', err, { newTitle, assignment });
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
					const assignment: Avo.Assignment.Assignment_v2 = await AssignmentService.fetchAssignmentById(
						(dataRow.id as unknown) as string
					);

					setMarkedAssignment(assignment);
					setDuplicateAssignmentModalOpen(true);
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

	const handleDuplicateModalClose = () => {
		setDuplicateAssignmentModalOpen(false);
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
							{
								icon: 'edit-2',
								id: 'edit',
								label: t('assignment/views/assignment-overview___bewerk'),
							},
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

	const renderCell = (
		assignment: Avo.Assignment.Assignment_v2,
		colKey: AssignmentOverviewTableColumns
	) => {
		const cellData: any = (assignment as any)[colKey];
		const editLink = buildLink(APP_PATH.ASSIGNMENT_EDIT.route, { id: assignment.id });
		const detailLink = buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, { id: assignment.id });

		switch (colKey) {
			case 'title':
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

			case 'assignment_type':
				return `${capitalize(cellData)}`;

			case 'labels':
				const labels: Avo.Assignment.Label[] = AssignmentHelper.getLabels(
					assignment,
					'LABEL'
				).map((labelLink: any) => labelLink.assignment_label);
				const tagOptions = labels.map((labelObj: Avo.Assignment.Label) => ({
					id: labelObj.id,
					label: labelObj.label || '',
					color: labelObj.color_override || get(labelObj, 'enum_color.label', ''),
				}));
				return <TagList tags={tagOptions} swatches closable={false} />;

			case 'class_room':
				return AssignmentHelper.getClassroom(assignment);

			case 'author':
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

			case 'deadline_at':
				return formatTimestamp(cellData, false);

			case 'updated_at':
				return formatDate(cellData);

			case 'responses':
				return (
					<Link
						to={buildLink(APP_PATH.ASSIGNMENT_RESPONSES.route, { id: assignment.id })}
					>
						{(cellData || []).length}
					</Link>
				);

			case 'actions':
				if (isMobileWidth()) {
					return <Spacer margin="top">{renderActions(assignment)}</Spacer>;
				}
				return renderActions(assignment);

			default:
				return cellData;
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
							...selectedAssignmentLabelsIds,
							...selectedClassLabelsIds,
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
											label: t('Actieve opdrachten'),
											value: 'assignments',
										},
										{
											label: t('Afgelopen opdrachten'),
											value: 'finished_assignments',
										},
									]}
									value={activeView}
									onChange={(activeViewId: string) =>
										setActiveView(activeViewId as Avo.Assignment.View)
									}
									className="c-assignment-overview__archive-select"
								/>
							) : (
								<ButtonGroup className="c-assignment-overview__archive-buttons">
									<Button
										type="secondary"
										label={t('Actieve opdrachten')}
										title={t('Filter op actieve opdrachten')}
										active={activeView === 'assignments'}
										onClick={() => setActiveView('assignments')}
									/>
									<Button
										type="secondary"
										label={t('Afgelopen opdrachten')}
										title={t('Filter op afgelopen opdrachten')}
										active={activeView === 'finished_assignments'}
										onClick={() => setActiveView('finished_assignments')}
									/>
								</ButtonGroup>
							)}
							{canEditAssignments && (
								<>
									<CheckboxDropdownModal
										label={t('Klas')}
										id="Klas"
										options={getLabelOptions(AssignmentLabelType.CLASS)}
										onChange={setSelectedClassLabelsIds}
									/>
									<CheckboxDropdownModal
										label={t('Label')}
										id="Label"
										options={getLabelOptions(AssignmentLabelType.LABEL)}
										onChange={setSelectedAssignmentLabelsIds}
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
								<FormGroup>
									<TextInput
										className="c-assignment-overview__search-input"
										icon="filter"
										value={filterString}
										onChange={setFilterString}
										disabled={!assignments || !assignments.length}
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
		if (canEditAssignments) {
			// Teacher
			if (activeView === 'assignments') {
				return t(
					'assignment/views/assignment-overview___je-hebt-nog-geen-opdrachten-aangemaakt'
				);
			}
			return t(
				'assignment/views/assignment-overview___je-hebt-nog-geen-opdrachten-gearchiveerd'
			);
		}
		// Pupil
		if (activeView === 'assignments') {
			return t(
				'assignment/views/assignment-overview___je-hebt-nog-geen-opdrachten-ontvangen-van-je-leerkracht'
			);
		}
		return t('assignment/views/assignment-overview___er-zijn-nog-geen-opdrachten-verlopen');
	};

	const getEmptyFallbackDescription = () => {
		if (canEditAssignments) {
			// Teacher
			if (activeView === 'assignments') {
				return t(
					'assignment/views/assignment-overview___beschrijving-hoe-een-opdracht-aan-te-maken'
				);
			}
			return t(
				'assignment/views/assignment-overview___beschrijving-gearchiveerde-opdrachten-in-werkruimte'
			);
		}
		// Pupil
		if (activeView === 'assignments') {
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
			if (activeView === 'assignments') {
				return 'clipboard';
			}
			return 'archive';
		}
		// Pupil
		if (activeView === 'assignments') {
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
					columns={tableColumns}
					data={assignments}
					emptyStateMessage={
						filterString
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
					onColumnClick={(columnId: string) =>
						handleColumnClick(columnId as AssignmentOverviewTableColumns)
					}
					sortColumn={sortColumn}
					sortOrder={sortOrder}
					useCards={isMobileWidth()}
				/>
				<Spacer margin="top-large">
					<Pagination
						pageCount={Math.ceil(assignmentCount / ITEMS_PER_PAGE)}
						currentPage={page}
						onPageChange={setPage}
					/>
				</Spacer>

				<DeleteObjectModal
					title={t(
						'assignment/views/assignment-overview___ben-je-zeker-dat-je-deze-opdracht-wil-verwijderen'
					)}
					body={t(
						'assignment/views/assignment-overview___deze-actie-kan-niet-ongedaan-gemaakt-worden'
					)}
					isOpen={isDeleteAssignmentModalOpen}
					onClose={handleDeleteModalClose}
					deleteObjectCallback={() =>
						deleteCurrentAssignment(get(markedAssignment, 'id', null))
					}
				/>

				<InputModal
					title={t('assignment/views/assignment-overview___dupliceer-taak')}
					inputLabel={t(
						'assignment/views/assignment-overview___geef-de-nieuwe-taak-een-naam'
					)}
					inputValue={get(markedAssignment, 'title', '')}
					inputPlaceholder={t(
						'assignment/views/assignment-overview___titel-van-de-nieuwe-taak'
					)}
					isOpen={isDuplicateAssignmentModalOpen}
					onClose={handleDuplicateModalClose}
					inputCallback={(newTitle: string) =>
						attemptDuplicateAssignment(newTitle, markedAssignment)
					}
					emptyMessage={t(
						'assignment/views/assignment-overview___gelieve-een-opdracht-titel-in-te-vullen'
					)}
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
