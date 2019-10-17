import { useMutation } from '@apollo/react-hooks';
import { ApolloQueryResult } from 'apollo-client';
import { capitalize, get } from 'lodash-es';
import React, { FunctionComponent, ReactText, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import {
	Button,
	ButtonGroup,
	ButtonToolbar,
	Container,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Flex,
	Form,
	FormGroup,
	Icon,
	MenuContent,
	Pagination,
	Spacer,
	Table,
	TagList,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';

import { connect } from 'react-redux';
import { selectLogin } from '../../authentication/store/selectors';
import { LoginResponse } from '../../authentication/store/types';
import { RouteParts } from '../../constants';
import { ITEMS_PER_PAGE } from '../../my-workspace/constants';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import DeleteObjectModal from '../../shared/components/modals/DeleteObjectModal';
import InputModal from '../../shared/components/modals/InputModal';
import { formatTimestamp, fromNow } from '../../shared/helpers/formatters/date';
import { dataService } from '../../shared/services/data-service';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import { IconName } from '../../shared/types/types';
import {
	DELETE_ASSIGNMENT,
	GET_ASSIGNMENT_BY_ID,
	GET_ASSIGNMENTS_BY_OWNER_ID,
	INSERT_ASSIGNMENT,
	UPDATE_ASSIGNMENT,
} from '../graphql';
import { deleteAssignment, insertAssignment, updateAssignment } from '../services';
import { Assignment, AssignmentColumn, AssignmentTag, AssignmentView } from '../types';

type ExtraAssignmentOptions = 'edit' | 'duplicate' | 'archive' | 'delete';

interface AssignmentOverviewProps extends RouteComponentProps {
	loginState: LoginResponse | null;
}

const AssignmentOverview: FunctionComponent<AssignmentOverviewProps> = ({
	history,
	loginState,
}) => {
	const [filterString, setFilterString] = useState<string>('');
	const [activeView, setActiveView] = useState<AssignmentView>('assignments');
	const [dropdownOpenForAssignmentId, setDropdownOpenForAssignmentId] = useState<
		string | number | null
	>(null);
	const [isDuplicateAssignmentModalOpen, setDuplicateAssignmentModalOpen] = useState<boolean>(
		false
	);
	const [isDeleteAssignmentModalOpen, setDeleteAssignmentModalOpen] = useState<boolean>(false);
	const [markedAssignment, setMarkedAssignment] = useState<null | Partial<Assignment>>(null);
	const [sortColumn, setSortColumn] = useState<keyof Assignment>('created_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [page, setPage] = useState<number>(0);

	const [triggerAssignmentDelete] = useMutation(DELETE_ASSIGNMENT);
	const [triggerAssignmentInsert] = useMutation(INSERT_ASSIGNMENT);
	const [triggerAssignmentUpdate] = useMutation(UPDATE_ASSIGNMENT);

	const getFilterObject = () => {
		const filter = filterString && filterString.trim();

		if (!filter) {
			return {};
		}

		return [
			{ title: { _ilike: `%${filter}%` } },
			{ assignment_assignment_tags: { assignment_tag: { label: { _ilike: `%${filter}%` } } } },
			{ class_room: { _ilike: `%${filter}%` } },
			{ assignment_type: { _ilike: `%${filter}%` } },
		];
	};

	const handleColumnClick = (columnId: keyof Assignment) => {
		if (sortColumn === columnId) {
			// Flip previous ordering
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			// Set initial ordering for new column
			setSortColumn(columnId);
			setSortOrder('asc');
		}
	};

	const getAssigmentById = async (assignmentId: number | string) => {
		const response: ApolloQueryResult<Assignment> = await dataService.query({
			query: GET_ASSIGNMENT_BY_ID,
			variables: { id: assignmentId },
		});
		const assignment = get(response, 'data.app_assignments[0]');

		if (!assignment) {
			toastService('Het ophalen van de opdracht is mislukt', TOAST_TYPE.DANGER);
			return;
		}
		return assignment;
	};

	const duplicateAssignment = async (
		newTitle: string,
		assignment: Partial<Assignment> | null,
		refetchAssignments: () => void
	) => {
		try {
			if (assignment) {
				delete assignment.id;
				assignment.title = newTitle;
				const duplicateAssignment = await insertAssignment(triggerAssignmentInsert, assignment);
				if (!duplicateAssignment) {
					return; // assignment was not valid => validation service already showed a toast
				}
				refetchAssignments();
				toastService('De opdracht is gedupliceerd', TOAST_TYPE.SUCCESS);
			}
		} catch (err) {
			console.error(err);
			toastService('Het dupliceren van de opdracht is mislukt', TOAST_TYPE.DANGER);
		}
	};

	const archiveAssignment = async (
		assignmentId: number | string,
		refetchAssignments: () => void
	) => {
		try {
			const assignment: Partial<Assignment> = await getAssigmentById(assignmentId);
			if (assignment) {
				const archivedAssigment: Partial<Assignment> = {
					...assignment,
					is_archived: !assignment.is_archived,
				};

				if (await updateAssignment(triggerAssignmentUpdate, archivedAssigment)) {
					refetchAssignments();
					toastService(
						`De opdracht is ge${archivedAssigment.is_archived ? '' : 'de'}archiveerd`,
						TOAST_TYPE.SUCCESS
					);
				}
				// else: assignment was not valid and could not be saved yet
				// the update assignment function will have already notified the user of the validation errors
			}
		} catch (err) {
			console.error(err);
			toastService(
				`Het ${
					activeView === 'archived_assignments' ? 'de' : ''
				}archiveren van de opdracht is mislukt`,
				TOAST_TYPE.DANGER
			);
		}
	};

	const deleteCurrentAssignment = async (
		assignmentId: number | string | null,
		refetchAssignments: () => void
	) => {
		try {
			if (typeof assignmentId === 'undefined' || assignmentId === null) {
				toastService('De huidige opdracht is nog nooit opgeslagen (geen id)', TOAST_TYPE.DANGER);
				return;
			}
			await deleteAssignment(triggerAssignmentDelete, assignmentId);
			refetchAssignments();
			toastService('De opdracht is verwijdert', TOAST_TYPE.SUCCESS);
		} catch (err) {
			console.error(err);
			toastService('Het verwijderen van de opdracht is mislukt', TOAST_TYPE.DANGER);
		}
	};

	const handleExtraOptionsItemClicked = async (
		actionId: ExtraAssignmentOptions,
		dataRow: Partial<Assignment>,
		refetchAssignments: () => void
	) => {
		if (!dataRow.id) {
			toastService('Het opdracht id van de geselecteerde rij is niet ingesteld', TOAST_TYPE.DANGER);
			return;
		}
		switch (actionId) {
			case 'edit':
				history.push(
					`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/${dataRow.id}/${RouteParts.Edit}`
				);
				break;
			case 'duplicate':
				const assignment: Partial<Assignment> = await getAssigmentById(dataRow.id);
				if (assignment) {
					setMarkedAssignment(assignment);
					setDuplicateAssignmentModalOpen(true);
				} else {
					toastService('Het ophalen van de details van de opdracht is mislukt', TOAST_TYPE.DANGER);
				}
				break;
			case 'archive':
				await archiveAssignment(dataRow.id, refetchAssignments);
				break;
			case 'delete':
				setMarkedAssignment(dataRow);
				setDeleteAssignmentModalOpen(true);
				break;
			default:
				return null;
		}

		setDropdownOpenForAssignmentId(null);
	};

	const handleDeleteModalClose = () => {
		setDeleteAssignmentModalOpen(false);
		setMarkedAssignment(null);
	};

	const handleDuplicateModalClose = () => {
		setDuplicateAssignmentModalOpen(false);
		setMarkedAssignment(null);
	};

	const renderCell = (
		rowData: Assignment,
		colKey: keyof Assignment | 'actions',
		rowIndex: number,
		colIndex: number,
		refetchAssignments: () => void
	) => {
		const cellData: any = (rowData as any)[colKey];

		switch (colKey) {
			case 'title':
				return (
					<Flex>
						<Spacer margin={'right-small'}>
							<Icon name="clipboard" subtle />
						</Spacer>
						<div className="c-content-header c-content-header--small">
							<h3 className="c-content-header__header u-m-0">
								<Link
									to={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/${rowData.id}/${
										RouteParts.Edit
									}`}
								>
									{rowData.title}
								</Link>
							</h3>
						</div>
					</Flex>
				);
			case 'assignment_type':
				return `${capitalize(cellData)}`;
			case 'assignment_assignment_tags':
				const assignmentTags: AssignmentTag[] = get(cellData, 'assignment_tag', []);
				const tagOptions = assignmentTags.map((tag: AssignmentTag) => ({
					id: tag.id,
					label: tag.label,
					color: tag.color_override || tag.enum_color.label,
				}));
				return <TagList tags={tagOptions} swatches closable={false} bordered={false} />;
			case 'class_room':
				return cellData;
			case 'deadline_at':
				return <span title={formatTimestamp(cellData)}>{fromNow(cellData)}</span>;
			case 'assignment_responses':
				return (
					<Link
						to={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/${RouteParts.Assignments}/${
							rowData.id
						}/${RouteParts.Responses}`}
					>
						{(cellData || []).length}
					</Link>
				);
			case 'actions':
				return (
					<ButtonToolbar>
						<Dropdown
							isOpen={dropdownOpenForAssignmentId === rowData.id}
							menuWidth="fit-content"
							onClose={() => setDropdownOpenForAssignmentId(null)}
							onOpen={() => setDropdownOpenForAssignmentId(rowData.id)}
							placement="bottom-end"
						>
							<DropdownButton>
								<Button icon="more-horizontal" type="borderless" />
							</DropdownButton>
							<DropdownContent>
								<MenuContent
									menuItems={[
										{ icon: 'edit2' as IconName, id: 'edit', label: 'Bewerk' },
										{
											icon: 'archive' as IconName,
											id: 'archive',
											label: activeView === 'archived_assignments' ? 'Dearchiveer' : 'Archiveer',
										},
										{ icon: 'copy' as IconName, id: 'duplicate', label: 'Dupliceer' },
										{ icon: 'delete' as IconName, id: 'delete', label: 'Verwijder' },
									]}
									onClick={(actionId: ReactText) =>
										handleExtraOptionsItemClicked(
											actionId.toString() as ExtraAssignmentOptions,
											rowData,
											refetchAssignments
										)
									}
								/>
							</DropdownContent>
						</Dropdown>

						<Button
							icon="chevron-right"
							onClick={() =>
								history.push(
									`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/${rowData.id}/${
										RouteParts.Edit
									}`
								)
							}
							type="borderless"
						/>
					</ButtonToolbar>
				);
			default:
				return cellData;
		}
	};

	const columns: AssignmentColumn[] = [
		{ id: 'title', label: 'Titel', sortable: true },
		// { id: 'assignment_type', label: 'Type', sortable: true }, // https://district01.atlassian.net/browse/AVO2-421
		{ id: 'assignment_assignment_tags', label: 'Vak of project' },
		{ id: 'class_room', label: 'Klas', sortable: true },
		{ id: 'deadline_at', label: 'Deadline', sortable: true },
		// { id: 'assignment_responses', label: 'Indieningen' }, // https://district01.atlassian.net/browse/AVO2-421
		{ id: 'actions', label: '' },
	];

	const renderAssignmentsTable = (
		data: {
			assignments: Assignment[];
			count: { aggregate: { count: number } };
		},
		refetchAssignments: () => void
	) => {
		return (
			<>
				<Table
					columns={columns}
					data={data.assignments}
					emptyStateMessage={
						filterString
							? 'Er zijn geen opdrachten die voldoen aan de zoekopdracht'
							: activeView === 'archived_assignments'
							? 'Er zijn nog geen opdrachten gearchiveerd'
							: 'Er zijn nog geen opdrachten aangemaakt'
					}
					renderCell={(rowData: Assignment, colKey: string, rowIndex: number, colIndex: number) =>
						renderCell(
							rowData,
							colKey as keyof Assignment | 'actions',
							rowIndex,
							colIndex,
							refetchAssignments
						)
					}
					rowKey="id"
					styled
					onColumnClick={handleColumnClick as any}
					sortColumn={sortColumn}
					sortOrder={sortOrder}
				/>
				<Spacer margin="top-large">
					<Pagination
						pageCount={Math.ceil(data.count.aggregate.count / ITEMS_PER_PAGE)}
						currentPage={page}
						onPageChange={setPage}
					/>
				</Spacer>

				<DeleteObjectModal
					title="Ben je zeker dat je deze opdracht wil verwijderen?"
					body="Deze actie kan niet ongedaan gemaakt worden"
					isOpen={isDeleteAssignmentModalOpen}
					onClose={handleDeleteModalClose}
					deleteObjectCallback={() =>
						deleteCurrentAssignment(get(markedAssignment, 'id', null), refetchAssignments)
					}
				/>

				<InputModal
					title="Dupliceer taak"
					inputLabel="Geef de nieuwe taak een naam:"
					inputValue={get(markedAssignment, 'title', '')}
					inputPlaceholder="Titel van de nieuwe taak"
					isOpen={isDuplicateAssignmentModalOpen}
					onClose={handleDuplicateModalClose}
					inputCallback={(newTitle: string) =>
						duplicateAssignment(newTitle, markedAssignment, refetchAssignments)
					}
				/>
			</>
		);
	};

	return (
		<Container mode="vertical" size="small">
			<Container mode="horizontal">
				<Toolbar>
					<ToolbarLeft>
						<ToolbarItem>
							<ButtonGroup>
								<Button
									type="secondary"
									label="Opdrachten"
									active={activeView === 'assignments'}
									onClick={() => setActiveView('assignments')}
								/>
								<Button
									type="secondary"
									label="Gearchiveerde opdrachten"
									active={activeView === 'archived_assignments'}
									onClick={() => setActiveView('archived_assignments')}
								/>
							</ButtonGroup>
						</ToolbarItem>
					</ToolbarLeft>
					<ToolbarRight>
						<ToolbarItem>
							<Form type="inline">
								<FormGroup>
									<TextInput icon="filter" value={filterString} onChange={setFilterString} />
								</FormGroup>
							</Form>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>

				{get(loginState, 'userInfo.profile.id') && (
					<DataQueryComponent
						query={GET_ASSIGNMENTS_BY_OWNER_ID}
						variables={{
							owner_profile_id: get(loginState, 'userInfo.profile.id'),
							archived: activeView === 'archived_assignments',
							order: { [sortColumn]: sortOrder },
							offset: page * ITEMS_PER_PAGE,
							filter: getFilterObject(),
						}}
						renderData={renderAssignmentsTable}
						resultPath=""
						ignoreNotFound
					/>
				)}
			</Container>
		</Container>
	);
};

const mapStateToProps = (state: any) => ({
	loginState: selectLogin(state),
});

export default withRouter(connect(mapStateToProps)(AssignmentOverview));
