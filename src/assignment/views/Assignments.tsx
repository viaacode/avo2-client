import { capitalize, get } from 'lodash-es';
import React, { Fragment, FunctionComponent, useState } from 'react';
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
import { ITEMS_PER_PAGE } from '../../my-workspace/constants';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import { formatTimestamp, fromNow } from '../../shared/helpers/formatters/date';
import { GET_ASSIGNMENTS_BY_OWNER_ID } from '../graphql';
import { Assignment, AssignmentColumn, AssignmentTag, AssignmentView } from '../types';

interface AssignmentsProps extends RouteComponentProps {}

const Assignments: FunctionComponent<AssignmentsProps> = ({ history }) => {
	const [filterString, setFilterString] = useState<string>('');
	const [activeView, setActiveView] = useState<AssignmentView>('assignments');
	const [actionsDropdownOpen, setActionsDropdownOpen] = useState<{ [key: string]: boolean }>({});
	const [sortColumn, setSortColumn] = useState<keyof Assignment>('deadline_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const [page, setPage] = useState<number>(0);

	const getFilterObject = () => {
		const filter = filterString && filterString.trim();
		const uppercaseFilter = filter && filter.toUpperCase();
		if (filter) {
			return [
				{ title: { _like: `%${filter}%` } },
				{ assignment_assignment_tags: { assignment_tag: { label: { _like: `%${filter}%` } } } },
				{ class_room: { _like: `%${filter}%` } },
				{ assignment_type: { _like: `%${filter}%` } },
				{ title: { _like: `%${uppercaseFilter}%` } },
				{
					assignment_assignment_tags: {
						assignment_tag: { label: { _like: `%${uppercaseFilter}%` } },
					},
				},
				{ class_room: { _like: `%${uppercaseFilter}%` } },
				{ assignment_type: { _like: `%${uppercaseFilter}%` } },
			];
		} else {
			return {};
		}
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
								<Link to={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/${rowData.id}`}>
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
		{ id: 'assignment_assignment_tags', label: 'Vak of project' },
		{ id: 'class_room', label: 'Klas', sortable: true },
		{ id: 'deadline_at', label: 'Deadline', sortable: true },
		{ id: 'assignment_responses', label: 'Indieningen' },
		{ id: 'actions', label: '' },
	];

	const renderAssignmentsTable = (data: {
		assignments: Assignment[];
		count: { aggregate: { count: number } };
	}) => {
		return (
			<Fragment>
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
					renderCell={renderCell}
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
			</Fragment>
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
				<DataQueryComponent
					query={GET_ASSIGNMENTS_BY_OWNER_ID}
					variables={{
						ownerId: '54859c98-d5d3-1038-8d91-6dfda901a78e',
						archived: activeView === 'archived_assignments',
						order: { [sortColumn]: sortOrder },
						offset: page * ITEMS_PER_PAGE,
						filter: getFilterObject(),
					}}
					renderData={renderAssignmentsTable}
					resultPath=""
					ignoreNotFound
				/>
			</Container>
		</Container>
	);
};

export default withRouter(Assignments);
