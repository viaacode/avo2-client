import { capitalize, get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
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

import { RouteParts } from '../../constants';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import { formatTimestamp, fromNow } from '../../shared/helpers/formatters/date';
import { GET_ASSIGNMENTS_BY_OWNER_ID } from '../graphql';
import { Assignment, AssignmentColumn, AssignmentTag, AssignmentView } from '../types';

interface AssignmentsProps extends RouteComponentProps {}

const Assignments: FunctionComponent<AssignmentsProps> = ({ history }) => {
	const [filterString, setFilterString] = useState<string>('');
	const [activeView, setActiveView] = useState<AssignmentView>('assignments');
	const [actionsDropdownOpen, setActionsDropdownOpen] = useState<{ [key: string]: boolean }>({});

	// TODO: Replace colKey type by AssignmentColumnKey when typings 1.9.0 is published
	const renderCell = (rowData: Assignment, colKey: keyof Assignment | 'actions') => {
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
							isOpen={actionsDropdownOpen[rowData.id] || false}
							onClose={() => setActionsDropdownOpen({ [rowData.id]: false })}
							onOpen={() => setActionsDropdownOpen({ [rowData.id]: true })}
							placement="bottom-end"
						>
							<DropdownButton>
								<Button icon="more-horizontal" type="borderless" />
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

	const renderAssignmentsView = (assignments: Assignment[]) => (
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
					renderCell={renderCell}
					rowKey="id"
					styled
				/>
				<Pagination pageCount={0} />
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
