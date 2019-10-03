import { capitalize, get } from 'lodash-es';
import React, { FunctionComponent, ReactText, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import {
	Button,
	ButtonGroup,
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

import { useMutation } from '@apollo/react-hooks';
import { ApolloQueryResult } from 'apollo-client';
import { RouteParts } from '../../constants';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import DeleteObjectModal from '../../shared/components/modals/DeleteObjectModal';
import { formatTimestamp, fromNow } from '../../shared/helpers/formatters/date';
import { dataService } from '../../shared/services/data-service';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
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

interface AssignmentsProps extends RouteComponentProps {}

const Assignments: FunctionComponent<AssignmentsProps> = ({ history }) => {
	const [filterString, setFilterString] = useState<string>('');
	const [activeView, setActiveView] = useState<AssignmentView>('assignments');
	const [dropdownOpenForAssignmentId, setDropdownOpenForAssignmentId] = useState<
		string | number | null
	>(null);
	const [isDeleteAssignmentModalOpen, setDeleteAssignmentModalOpen] = useState<boolean>(false);
	const [assignmentIdToBeDeleted, setAssignmentIdToBeDeleted] = useState<null | number | string>(
		null
	);
	const [triggerAssignmentDelete] = useMutation(DELETE_ASSIGNMENT);
	const [triggerAssignmentInsert] = useMutation(INSERT_ASSIGNMENT);
	const [triggerAssignmentUpdate] = useMutation(UPDATE_ASSIGNMENT);

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

	const duplicateAssignment = async (assignmentId: number, refetchAssignments: () => void) => {
		try {
			const assignment: Partial<Assignment> = await getAssigmentById(assignmentId);
			if (assignment) {
				delete assignment.id;
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
			toastService('Hey opdracht id van de geselecteerde rij is niet ingesteld', TOAST_TYPE.DANGER);
			return;
		}
		switch (actionId) {
			case 'edit':
				history.push(
					`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/${dataRow.id}/${RouteParts.Edit}`
				);
				break;
			case 'duplicate':
				await duplicateAssignment(dataRow.id, refetchAssignments);
				break;
			case 'archive':
				await archiveAssignment(dataRow.id, refetchAssignments);
				break;
			case 'delete':
				setAssignmentIdToBeDeleted(dataRow.id);
				setDeleteAssignmentModalOpen(true);
				break;
			default:
				return null;
		}

		setDropdownOpenForAssignmentId(null);
	};

	const handleDeleteModalClose = () => {
		setDeleteAssignmentModalOpen(false);
		setAssignmentIdToBeDeleted(null);
	};

	// TODO: Replace colKey type by AssignmentColumnKey when typings 1.9.0 is published
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
				return `${capitalize(cellData)}opdracht`;
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
					<div className="c-button-toolbar">
						<Dropdown
							autoSize
							isOpen={dropdownOpenForAssignmentId === rowData.id}
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
										{ icon: 'edit2', id: 'edit', label: 'Bewerk' },
										{
											icon: 'archive',
											id: 'archive',
											label: activeView === 'archived_assignments' ? 'Dearchiveer' : 'Archiveer',
										},
										{ icon: 'copy', id: 'duplicate', label: 'Dupliceer' },
										{ icon: 'delete', id: 'delete', label: 'Verwijder' },
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
								history.push(`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/${rowData.id}`)
							}
							type="borderless"
						/>
					</div>
				);
			default:
				return cellData;
		}
	};

	const columns: AssignmentColumn[] = [
		{ id: 'title', label: 'Titel', sortable: true },
		{ id: 'assignment_type', label: 'Type', sortable: true },
		{ id: 'assignment_assignment_tags', label: 'Vak of project', sortable: true },
		{ id: 'class_room', label: 'Klas', sortable: true },
		{ id: 'deadline_at', label: 'Deadline', sortable: true },
		{ id: 'assignment_responses', label: 'Indieningen', sortable: true },
		{ id: 'actions', label: '' },
	];

	const renderAssignmentsView = (assignments: Assignment[], refetchAssignments: () => void) => (
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
				<Table
					columns={columns}
					data={assignments}
					emptyStateMessage="U hebt nog geen opdrachten aangemaakt"
					renderCell={(
						rowData: Assignment,
						colKey: keyof Assignment | 'actions',
						rowIndex: number,
						colIndex: number
					) => renderCell(rowData, colKey, rowIndex, colIndex, refetchAssignments)}
					rowKey="id"
					styled
				/>
				<Pagination pageCount={0} />

				<DeleteObjectModal
					title={`Ben je zeker dat je deze opdracht wil verwijderen?`}
					body="Deze actie kan niet ongedaan gemaakt worden"
					isOpen={isDeleteAssignmentModalOpen}
					onClose={handleDeleteModalClose}
					deleteObjectCallback={() =>
						deleteCurrentAssignment(assignmentIdToBeDeleted, refetchAssignments)
					}
				/>
			</Container>
		</Container>
	);

	return (
		<DataQueryComponent
			query={GET_ASSIGNMENTS_BY_OWNER_ID}
			variables={{
				ownerId: '54859c98-d5d3-1038-8d91-6dfda901a78e',
				archived: activeView === 'archived_assignments',
			}}
			renderData={renderAssignmentsView}
			resultPath="app_assignments"
			ignoreNotFound
		/>
	);
};

export default withRouter(Assignments);
