import { ApolloQueryResult } from 'apollo-client';
import { capitalize, get } from 'lodash-es';
import React, { FunctionComponent, ReactText, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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
	IconName,
	MenuContent,
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
import { getProfileId } from '../../authentication/helpers/get-profile-info';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH } from '../../constants';
import { DataQueryComponent, DeleteObjectModal, InputModal } from '../../shared/components';
import {
	buildLink,
	CustomError,
	formatTimestamp,
	fromNow,
	isMobileWidth,
	navigate,
} from '../../shared/helpers';
import { useTableSort } from '../../shared/hooks';
import { dataService, ToastService } from '../../shared/services';
import { ITEMS_PER_PAGE } from '../../workspace/workspace.const';

import { ErrorView } from '../../error/views';
import {
	GET_ASSIGNMENT_BY_ID,
	GET_ASSIGNMENTS_BY_OWNER_ID,
	GET_ASSIGNMENTS_BY_RESPONSE_OWNER_ID,
} from '../assignment.gql';
import { AssignmentService } from '../assignment.service';
import { AssignmentColumn, AssignmentOverviewTableColumns } from '../assignment.types';
import './AssignmentOverview.scss';

type ExtraAssignmentOptions = 'edit' | 'duplicate' | 'archive' | 'delete';

interface AssignmentOverviewProps extends DefaultSecureRouteProps {}

const AssignmentOverview: FunctionComponent<AssignmentOverviewProps> = ({ history, user }) => {
	const [t] = useTranslation();

	const [filterString, setFilterString] = useState<string>('');
	const [activeView, setActiveView] = useState<Avo.Assignment.View>('assignments');
	const [dropdownOpenForAssignmentId, setDropdownOpenForAssignmentId] = useState<
		string | number | null
	>(null);
	const [isDuplicateAssignmentModalOpen, setDuplicateAssignmentModalOpen] = useState<boolean>(
		false
	);
	const [isDeleteAssignmentModalOpen, setDeleteAssignmentModalOpen] = useState<boolean>(false);
	const [markedAssignment, setMarkedAssignment] = useState<Avo.Assignment.Assignment | null>(
		null
	);
	const [page, setPage] = useState<number>(0);
	const [canEditAssignments, setCanEditAssignments] = useState<boolean>(false);

	const [sortColumn, sortOrder, handleColumnClick] = useTableSort<
		AssignmentOverviewTableColumns | 'created_at'
	>('created_at');

	useEffect(() => {
		PermissionService.hasPermissions(PermissionName.EDIT_ASSIGNMENTS, user)
			.then((hasPermission: boolean) => {
				setCanEditAssignments(hasPermission);
			})
			.catch(err => {
				console.error('Failed to check permissions', err, {
					user,
					permissions: PermissionName.EDIT_ASSIGNMENTS,
				});
				ToastService.danger(
					t(
						'shared/components/loading-error-loaded-component/loading-error-loaded-component___er-ging-iets-mis-tijdens-het-controleren-van-de-rechten-van-je-account'
					)
				);
			});
	}, [user, t]);

	const getFilterObject = () => {
		const filter = filterString && filterString.trim();

		if (!filter) {
			return {};
		}

		return [
			{ title: { _ilike: `%${filter}%` } },
			{
				assignment_assignment_tags: {
					assignment_tag: { label: { _ilike: `%${filter}%` } },
				},
			},
			{ class_room: { _ilike: `%${filter}%` } },
			{ assignment_type: { _ilike: `%${filter}%` } },
		];
	};

	const getAssignmentById = async (
		assignmentId: number | string
	): Promise<Avo.Assignment.Assignment> => {
		const response: ApolloQueryResult<Avo.Assignment.Assignment> = await dataService.query({
			query: GET_ASSIGNMENT_BY_ID,
			variables: { id: assignmentId },
		});
		const assignment = get(response, 'data.app_assignments[0]');

		if (!assignment) {
			throw new CustomError('Failed to fetch the assignment', null, { assignmentId });
		}
		return assignment;
	};

	const attemptDuplicateAssignment = async (
		newTitle: string,
		assignment: Partial<Avo.Assignment.Assignment> | null,
		refetchAssignments: () => void
	) => {
		try {
			if (!assignment) {
				throw new CustomError(
					'Failed to duplicate the assignment because the marked assignment is null'
				);
			}
			await AssignmentService.duplicateAssignment(newTitle, assignment, user);

			refetchAssignments();

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

	const archiveAssignment = async (
		assignmentId: number | string,
		refetchAssignments: () => void
	) => {
		try {
			const assignment: Avo.Assignment.Assignment | null = await getAssignmentById(
				assignmentId
			);

			if (assignment) {
				const archivedAssignment: Partial<Avo.Assignment.Assignment> = {
					...assignment,
					is_archived: !assignment.is_archived,
				};

				if (await AssignmentService.updateAssignment(archivedAssignment)) {
					refetchAssignments();
					ToastService.success(
						archivedAssignment.is_archived
							? t(
									'assignment/views/assignment-overview___de-opdracht-is-gearchiveerd'
							  )
							: t(
									'assignment/views/assignment-overview___de-opdracht-is-gedearchiveerd'
							  )
					);
				}
				// else: assignment was not valid and could not be saved yet
				// the update assignment function will have already notified the user of the validation errors
			}
		} catch (err) {
			console.error(err);
			ToastService.danger(
				activeView === 'archived_assignments'
					? t(
							'assignment/views/assignment-overview___het-dearchiveren-van-de-opdracht-is-mislukt'
					  )
					: t(
							'assignment/views/assignment-overview___het-archiveren-van-de-opdracht-is-mislukt'
					  )
			);
		}
	};

	const deleteCurrentAssignment = async (
		assignmentId: number | string | null,
		refetchAssignments: () => void
	) => {
		try {
			if (typeof assignmentId === 'undefined' || assignmentId === null) {
				ToastService.danger(
					t(
						'assignment/views/assignment-overview___de-huidige-opdracht-is-nog-nooit-opgeslagen-geen-id'
					)
				);
				return;
			}
			await AssignmentService.deleteAssignment(assignmentId);
			refetchAssignments();
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
		dataRow: Avo.Assignment.Assignment,
		refetchAssignments: () => void
	) => {
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
					const assignment: Avo.Assignment.Assignment = await getAssignmentById(
						dataRow.id
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

	const renderActions = (rowData: Avo.Assignment.Assignment, refetchAssignments: () => void) => {
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
						<Button
							icon="more-horizontal"
							type="borderless"
							title={t('assignment/views/assignment-overview___meer-opties')}
						/>
					</DropdownButton>
					<DropdownContent>
						<MenuContent
							menuItems={[
								{
									icon: 'edit2' as IconName,
									id: 'edit',
									label: t('assignment/views/assignment-overview___bewerk'),
								},
								{
									icon: 'archive' as IconName,
									id: 'archive',
									label:
										activeView === 'archived_assignments'
											? t(
													'assignment/views/assignment-overview___dearchiveer'
											  )
											: t('assignment/views/assignment-overview___archiveer'),
								},
								{
									icon: 'copy' as IconName,
									id: 'duplicate',
									label: t('assignment/views/assignment-overview___dupliceer'),
								},
								{
									icon: 'delete' as IconName,
									id: 'delete',
									label: t('assignment/views/assignment-overview___verwijder'),
								},
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

				{!isMobileWidth() && (
					<Button
						icon="chevron-right"
						title={t('assignment/views/assignment-overview___bewerk-de-opdracht')}
						onClick={() =>
							navigate(history, APP_PATH.ASSIGNMENT_EDIT.route, {
								id: rowData.id,
							})
						}
						type="borderless"
					/>
				)}
			</ButtonToolbar>
		);
	};

	const renderCell = (
		rowData: Avo.Assignment.Assignment,
		colKey: AssignmentOverviewTableColumns,
		refetchAssignments: () => void
	) => {
		const cellData: any = (rowData as any)[colKey];
		const editLink = buildLink(APP_PATH.ASSIGNMENT_EDIT.route, { id: rowData.id });
		const detailLink = buildLink(APP_PATH.ASSIGNMENT_DETAIL.route, { id: rowData.id });

		switch (colKey) {
			case 'title':
				return (
					<Flex>
						<Spacer margin={'right-small'}>
							<Icon name="clipboard" subtle />
						</Spacer>
						<div className="c-content-header c-content-header--small">
							<h3 className="c-content-header__header u-m-0">
								<Link to={canEditAssignments ? editLink : detailLink}>
									{rowData.title}
								</Link>
							</h3>
						</div>
					</Flex>
				);

			case 'assignment_type':
				return `${capitalize(cellData)}`;

			case 'assignment_assignment_tags':
				const assignmentTags: Avo.Assignment.Tag[] = get(cellData, 'assignment_tag', []);
				const tagOptions = assignmentTags.map((tag: Avo.Assignment.Tag) => ({
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
					<Link to={buildLink(APP_PATH.ASSIGNMENT_RESPONSES.route, { id: rowData.id })}>
						{(cellData || []).length}
					</Link>
				);

			case 'actions':
				return renderActions(rowData, refetchAssignments);

			default:
				return cellData;
		}
	};

	const columns: AssignmentColumn[] = [
		{ id: 'title', label: t('assignment/views/assignment-overview___titel'), sortable: true },
		// { id: 'assignment_type', label: t('assignment/views/assignment-overview___type'), sortable: true }, // https://district01.atlassian.net/browse/AVO2-421
		...(isMobileWidth()
			? []
			: [
					{
						id: 'assignment_assignment_tags',
						label: t('assignment/views/assignment-overview___vak-of-project'),
					},
			  ]),
		...(isMobileWidth()
			? []
			: [
					{
						id: 'class_room',
						label: t('assignment/views/assignment-overview___klas'),
						sortable: true,
					},
			  ]),
		{
			id: 'deadline_at',
			label: t('assignment/views/assignment-overview___deadline'),
			sortable: true,
		},
		// { id: 'assignment_responses', label: t('assignment/views/assignment-overview___indieningen') }, // https://district01.atlassian.net/browse/AVO2-421
		{ id: 'actions', label: '' },
	] as AssignmentColumn[];

	const renderHeader = () => {
		return (
			<Toolbar className="m-assignment-overview__header-toolbar">
				<ToolbarLeft>
					<ToolbarItem>
						{isMobileWidth() ? (
							<Select
								options={[
									{
										label: t(
											'assignment/views/assignment-overview___opdrachten'
										),
										value: 'assignments',
									},
									{
										label: t(
											'assignment/views/assignment-overview___gearchiveerde-opdrachten'
										),
										value: 'archived_assignments',
									},
								]}
								value={activeView}
								onChange={activeViewId =>
									setActiveView(activeViewId as Avo.Assignment.View)
								}
								className="c-assignment-overview__archive-select"
							/>
						) : (
							<ButtonGroup>
								<Button
									type="secondary"
									label={t('assignment/views/assignment-overview___opdrachten')}
									title={t(
										'assignment/views/assignment-overview___filter-op-niet-gearchiveerde-opdrachten'
									)}
									active={activeView === 'assignments'}
									onClick={() => setActiveView('assignments')}
								/>
								<Button
									type="secondary"
									label={t(
										'assignment/views/assignment-overview___gearchiveerde-opdrachten'
									)}
									title={t(
										'assignment/views/assignment-overview___filter-op-gearchiveerde-opdrachten'
									)}
									active={activeView === 'archived_assignments'}
									onClick={() => setActiveView('archived_assignments')}
								/>
							</ButtonGroup>
						)}
					</ToolbarItem>
				</ToolbarLeft>
				<ToolbarRight>
					<ToolbarItem>
						<Form type="inline">
							<FormGroup>
								<TextInput
									icon="filter"
									value={filterString}
									onChange={setFilterString}
								/>
							</FormGroup>
						</Form>
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
		);
	};

	const onClickCreate = () => history.push(buildLink(APP_PATH.SEARCH.route));

	const renderEmptyFallback = () => (
		<ErrorView
			icon="clipboard"
			message={t(
				'assignment/views/assignment-overview___je-hebt-nog-geen-opdrachten-aangemaakt'
			)}
		>
			<p>
				<Trans i18nKey="assignment/views/assignment-overview___beschrijving-hoe-een-opdracht-aan-te-maken">
					Beschrijving hoe een opdracht aan te maken
				</Trans>
			</p>
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
		</ErrorView>
	);

	const renderAssignmentsView = (
		data: {
			app_assignments?: Avo.Assignment.Assignment[];
			app_assignment_responses?: Avo.Assignment.Response[];
			count: { aggregate: { count: number } };
		},
		refetchAssignments: () => void
	) => {
		const assignments = [];
		assignments.push(
			...(data.app_assignment_responses || []).map(response => response.assignment)
		);
		assignments.push(...(data.app_assignments || []));

		if (!assignments.length) {
			return renderEmptyFallback();
		}
		return (
			<Container mode="vertical" size="small">
				<Container mode="horizontal">
					{renderHeader()}
					<Table
						columns={columns}
						data={assignments}
						emptyStateMessage={
							filterString
								? t(
										'assignment/views/assignment-overview___er-zijn-geen-opdrachten-die-voldoen-aan-de-zoekopdracht'
								  )
								: activeView === 'archived_assignments'
								? t(
										'assignment/views/assignment-overview___er-zijn-nog-geen-opdrachten-gearchiveerd'
								  )
								: t(
										'assignment/views/assignment-overview___er-zijn-nog-geen-opdrachten-aangemaakt'
								  )
						}
						renderCell={(rowData: Avo.Assignment.Assignment, colKey: string) =>
							renderCell(
								rowData,
								colKey as AssignmentOverviewTableColumns,
								refetchAssignments
							)
						}
						rowKey="id"
						variant="styled"
						onColumnClick={columnId =>
							handleColumnClick(columnId as AssignmentOverviewTableColumns)
						}
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
						title={t(
							'assignment/views/assignment-overview___ben-je-zeker-dat-je-deze-opdracht-wil-verwijderen'
						)}
						body={t(
							'assignment/views/assignment-overview___deze-actie-kan-niet-ongedaan-gemaakt-worden'
						)}
						isOpen={isDeleteAssignmentModalOpen}
						onClose={handleDeleteModalClose}
						deleteObjectCallback={() =>
							deleteCurrentAssignment(
								get(markedAssignment, 'id', null),
								refetchAssignments
							)
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
							attemptDuplicateAssignment(
								newTitle,
								markedAssignment,
								refetchAssignments
							)
						}
						emptyMessage={t(
							'assignment/views/assignment-overview___gelieve-een-opdracht-titel-in-te-vullen'
						)}
					/>
				</Container>
			</Container>
		);
	};

	return canEditAssignments !== null ? (
		<DataQueryComponent
			query={
				canEditAssignments
					? GET_ASSIGNMENTS_BY_OWNER_ID
					: GET_ASSIGNMENTS_BY_RESPONSE_OWNER_ID
			}
			variables={{
				owner_profile_id: getProfileId(user),
				archived: activeView === 'archived_assignments',
				order: { [sortColumn]: sortOrder },
				offset: page * ITEMS_PER_PAGE,
				limit: ITEMS_PER_PAGE,
				filter: getFilterObject(),
			}}
			renderData={renderAssignmentsView}
			resultPath=""
			ignoreNotFound
			actionButtons={['home']}
		/>
	) : null;
};

export default AssignmentOverview;
