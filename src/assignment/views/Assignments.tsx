import {
	Button,
	Container,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Flex,
	FormGroup,
	Icon,
	MenuContent,
	Pagination,
	Spacer,
	TagList,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { capitalize, get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { RouteParts } from '../../constants';
import { formatTimestamp, fromNow } from '../../shared/helpers/formatters/date';
import { Table } from '../Table/Table'; // TODO remove once components new version is released
import { Assignment, AssignmentLayout, AssignmentTag, AssignmentType } from '../types';

interface AssignmentsProps extends RouteComponentProps {}

const Assignments: FunctionComponent<AssignmentsProps> = ({ history }) => {
	const [filterString, setFilterString] = useState<string>('');
	const [activeView, setActiveView] = useState<'assignments' | 'archived_assignments'>(
		'assignments'
	);
	const [actionsDropdownOpen, setActionsDropdownOpen] = useState<{ [key: string]: boolean }>({});

	const renderCell = (rowData: Assignment, colKey: keyof Assignment | 'actions') => {
		const cellData: any = (rowData as any)[colKey];

		switch (colKey) {
			case 'title':
				return (
					<Flex>
						<Spacer margin={'right-small'}>
							{/*TODO use subtle option when it becomes available*/}
							<Icon name="clipboard" className="o-svg-icon--subtle" />
						</Spacer>
						<div className="c-content-header c-content-header--small">
							<h3 className="c-content-header__header u-m-0">
								<Link to={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/${rowData.id}`}>
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
							isOpen={actionsDropdownOpen[rowData.id] || false}
							onClose={() => setActionsDropdownOpen({ [rowData.id]: false })}
							onOpen={() => setActionsDropdownOpen({ [rowData.id]: true })}
							placement="bottom-end"
						>
							<DropdownButton>
								<Button icon="more-horizontal" type="borderless" active />
							</DropdownButton>
							<DropdownContent>
								<MenuContent
									menuItems={[
										{ icon: 'edit2', id: 'edit', label: 'Bewerk' },
										{ icon: 'copy', id: 'duplicate', label: 'Dupliceer' },
										{ icon: 'delete', id: 'delete', label: 'Verwijder' },
									]}
									onClick={itemId => {
										switch (itemId) {
											case 'edit':
												history.push(
													`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/${rowData.id}/${
														RouteParts.Edit
													}`
												);
												break;
											case 'duplicate':
												break;
											case 'delete':
												break;
											default:
												return null;
										}
									}}
								/>
							</DropdownContent>
						</Dropdown>

						<Button
							icon="chevron-right"
							onClick={() =>
								history.push(`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/${rowData.id}`)
							}
							type="borderless"
							active
						/>
					</div>
				);
			default:
				return cellData;
		}
	};

	const columns: { id: keyof Assignment | 'actions'; label: string; sortable?: boolean }[] = [
		{ id: 'title', label: 'Titel', sortable: true },
		{ id: 'assignment_type', label: 'Type', sortable: true },
		{ id: 'assignment_assignment_tags', label: 'Vak of project', sortable: true },
		{ id: 'class_room', label: 'Klas', sortable: true },
		{ id: 'deadline_at', label: 'Deadline', sortable: true },
		{ id: 'assignment_responses', label: 'Indieningen', sortable: true },
		{ id: 'actions', label: '' },
	];

	const renderAssignmentsView = (assignments: Assignment[]) => (
		<Container mode="vertical" size="small">
			<Container mode="horizontal">
				<Toolbar>
					<ToolbarLeft>
						<ToolbarItem>
							{/*TODO create ButtonGroup in the components library*/}
							<div className="c-button-group">
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
							</div>
						</ToolbarItem>
					</ToolbarLeft>
					<ToolbarRight>
						<ToolbarItem>
							<div className="o-form-group-layout o-form-group-layout--inline">
								<FormGroup>
									<TextInput icon="filter" value={filterString} onChange={setFilterString} />
								</FormGroup>
							</div>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
				<Table
					columns={columns}
					data={assignments}
					emptyStateMessage="U hebt nog geen opdrachten aangemaakt"
					renderCell={renderCell}
					rowKey="id"
					styled
				/>
				<Pagination pageCount={0} />
			</Container>
		</Container>
	);

	return renderAssignmentsView([
		{
			id: 0,
			title: 'Een opdracht met een iets landere naam',
			description: '',
			content_layout: AssignmentLayout.PlayerAndText,
			assignment_type: 'kijk' as AssignmentType,
			assignment_assignment_tags: {
				assignment_tag: [
					{
						id: 0,
						label: 'Aarderijkskunde',
						enum_color: { label: '#FF0000', value: 'BRIGHT_RED' },
						color_override: null,
						user: {} as any,
					},
				],
			},
			class_room: '3A',
			available_at: null,
			deadline_at: new Date().toISOString(),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			is_deleted: false,
			is_collaborative: false,
			is_archived: false,
			owner_uid: '',
			assignment_responses: [
				{
					id: 0,
					assignment_id: 0,
					owner_uids: [],
				},
				{
					id: 1,
					assignment_id: 0,
					owner_uids: [],
				},
				{
					id: 2,
					assignment_id: 0,
					owner_uids: [],
				},
			],
		},
		{
			id: 1,
			title: 'Een opdracht',
			description: '',
			content_layout: AssignmentLayout.PlayerAndText,
			assignment_type: 'zoek' as AssignmentType,
			assignment_assignment_tags: {
				assignment_tag: [
					{
						id: 0,
						label: 'Aarderijkskunde',
						enum_color: { label: '#FF0000', value: 'BRIGHT_RED' },
						color_override: null,
						user: {} as any,
					},
				],
			},
			class_room: '3A',
			available_at: null,
			deadline_at: new Date().toISOString(),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			is_deleted: false,
			is_collaborative: false,
			is_archived: false,
			owner_uid: '',
			assignment_responses: [
				{
					id: 0,
					assignment_id: 0,
					owner_uids: [],
				},
				{
					id: 1,
					assignment_id: 0,
					owner_uids: [],
				},
				{
					id: 2,
					assignment_id: 0,
					owner_uids: [],
				},
			],
		},
		{
			id: 2,
			title: 'Een opdracht2',
			description: '',
			content_layout: AssignmentLayout.PlayerAndText,
			assignment_type: 'bouw' as AssignmentType,
			assignment_assignment_tags: {
				assignment_tag: [
					{
						id: 0,
						label: 'Biologie',
						enum_color: { label: '#FF0000', value: 'BRIGHT_RED' },
						color_override: null,
						user: {} as any,
					},
				],
			},
			class_room: '3A',
			available_at: null,
			deadline_at: new Date().toISOString(),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			is_deleted: false,
			is_collaborative: false,
			is_archived: false,
			owner_uid: '',
			assignment_responses: [
				{
					id: 0,
					assignment_id: 0,
					owner_uids: [],
				},
				{
					id: 1,
					assignment_id: 0,
					owner_uids: [],
				},
				{
					id: 2,
					assignment_id: 0,
					owner_uids: [],
				},
			],
		},
	]); // TODO get assignments from graphql
};

export default withRouter(Assignments);
