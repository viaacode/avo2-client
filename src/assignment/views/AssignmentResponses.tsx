import classnames from 'classnames';
import { cloneDeep, get, isNil } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';

import {
	BlockHeading,
	Button,
	Container,
	Flex,
	Form,
	FormGroup,
	Pagination,
	Spacer,
	Table,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	useKeyPress,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { SearchOrderDirection } from '@viaa/avo2-types/types/search';

import { cleanupObject } from '../../admin/shared/components/FilterTable/FilterTable.utils';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';
import {
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../shared/components';
import { buildLink, formatDate, isMobileWidth } from '../../shared/helpers';
import { truncateTableValue } from '../../shared/helpers/truncate';
import { useTableSort } from '../../shared/hooks';
import { ToastService } from '../../shared/services';
import { ITEMS_PER_PAGE } from '../../workspace/workspace.const';
import { GET_ASSIGNMENT_RESPONSE_OVERVIEW_COLUMNS } from '../assignment.const';
import { AssignmentService } from '../assignment.service';
import {
	AssignmentOverviewTableColumns,
	AssignmentResponseTableColumns,
	AssignmentType,
} from '../assignment.types';

import './AssignmentOverview.scss';

interface AssignmentResponsesProps extends DefaultSecureRouteProps<{ id: string }> {
	onUpdate: () => void | Promise<void>;
}

const DEFAULT_SORT_COLUMN = 'updated_at';
const DEFAULT_SORT_ORDER = 'desc';

const AssignmentResponses: FunctionComponent<AssignmentResponsesProps> = ({
	onUpdate = () => {},
	// history,
	match,
	user,
}) => {
	const [t] = useTranslation();

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [assignment, setAssignment] = useState<Avo.Assignment.Assignment_v2 | null>(null);
	const [assignmentResponses, setAssignmentResponses] = useState<
		Avo.Assignment.Response_v2[] | null
	>(null);
	const [assignmentResponsesCount, setAssigmentResponsesCount] = useState<number>(0);
	const [filterString, setFilterString] = useState<string>('');
	const [isDeleteAssignmentResponseModalOpen, setDeleteAssignmentResponseModalOpen] = useState<
		boolean
	>(false);
	const [
		markedAssignmentResponse,
		setMarkedAssignmentResponse,
	] = useState<Avo.Assignment.Response_v2 | null>(null);
	const [canEditAssignments, setCanEditAssignments] = useState<boolean | null>(null);

	const [sortColumn, sortOrder, handleColumnClick, setSortColumn, setSortOrder] = useTableSort<
		AssignmentOverviewTableColumns
	>(DEFAULT_SORT_COLUMN, DEFAULT_SORT_ORDER);

	const tableColumns = useMemo(
		() =>
			GET_ASSIGNMENT_RESPONSE_OVERVIEW_COLUMNS(
				(assignment?.assignment_type || AssignmentType.KIJK) as AssignmentType
			),
		[assignment]
	);

	const [query, setQuery] = useQueryParams({
		filter: StringParam,
		page: NumberParam,
		sort_column: StringParam,
		sort_order: StringParam,
	});

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
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

	const fetchAssignment = useCallback(async () => {
		try {
			const assignmentId = match.params.id;

			const assignment = await AssignmentService.fetchAssignmentById(assignmentId);

			setAssignment(assignment);
		} catch (err) {
			setLoadingInfo({
				state: 'error',
				message: t(
					'assignment/views/assignment-overview___het-ophalen-van-je-opdrachten-is-mislukt'
				),
			});
		}
	}, [match, t]);

	const fetchAssignmentResponses = useCallback(async () => {
		try {
			if (isNil(canEditAssignments)) {
				return;
			}

			const assignmentId = match.params.id;

			const column = tableColumns.find(
				(tableColumn: any) => tableColumn.id || '' === (sortColumn as any)
			);
			const columnDataType: string = get(column, 'dataType', '');

			const response = await AssignmentService.fetchAssignmentResponses(
				assignmentId,
				user,
				sortColumn,
				sortOrder,
				columnDataType,
				query.page || 0,
				query.filter || ''
			);

			setAssignmentResponses(response.assignmentResponses);
			setAssigmentResponsesCount(response.count);
		} catch (err) {
			setLoadingInfo({
				state: 'error',
				message: t(
					'assignment/views/assignment-overview___het-ophalen-van-je-opdrachten-is-mislukt'
				),
			});
		}
	}, [
		canEditAssignments,
		match.params.id,
		tableColumns,
		user,
		sortColumn,
		sortOrder,
		query.page,
		query.filter,
		t,
	]);

	useEffect(() => {
		checkPermissions();
	}, [checkPermissions]);

	useEffect(() => {
		fetchAssignment();
	}, [fetchAssignment, match]);

	useEffect(() => {
		if (!isNil(canEditAssignments)) {
			fetchAssignmentResponses();
		}
	}, [canEditAssignments, fetchAssignmentResponses]);

	useEffect(() => {
		if (!isNil(assignmentResponses) && !isNil(assignmentResponsesCount) && !isNil(assignment)) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [assignmentResponses, assignmentResponsesCount, assignment]);

	const deleteCurrentAssignment = async (assignmentResponseId: string | null) => {
		try {
			if (isNil(assignmentResponseId)) {
				ToastService.danger(
					t(
						'assignment/views/assignment-overview___de-huidige-opdracht-is-nog-nooit-opgeslagen-geen-id'
					)
				);
				return;
			}

			await AssignmentService.deleteAssignmentResponse(assignmentResponseId);
			await fetchAssignmentResponses();

			onUpdate();
			ToastService.success(t('De response is verwijderd'));
		} catch (err) {
			console.error(err);
			ToastService.danger(
				t(
					'assignment/views/assignment-overview___het-verwijderen-van-de-opdracht-is-mislukt'
				)
			);
		}
	};

	const renderDeleteAction = (assignmentResponse: Avo.Assignment.Response_v2) => (
		<Button
			title={t('workspace/views/bookmarks___verwijder-uit-bladwijzers')}
			ariaLabel={t('workspace/views/bookmarks___verwijder-uit-bladwijzers')}
			icon="delete"
			type="danger-hover"
			onClick={() => {
				setMarkedAssignmentResponse(assignmentResponse);
				setDeleteAssignmentResponseModalOpen(true);
			}}
		/>
	);

	const handleDeleteModalClose = () => {
		setDeleteAssignmentResponseModalOpen(false);
		setMarkedAssignmentResponse(null);
	};

	const renderCell = (
		assignmentResponse: Avo.Assignment.Response_v2,
		colKey: AssignmentResponseTableColumns
	) => {
		const cellData: any = (assignmentResponse as any)[colKey];

		switch (colKey) {
			case 'pupil':
				const renderTitle = () => (
					<Flex>
						<div className="c-content-header c-content-header--small">
							<h3 className="c-content-header__header u-m-0">
								{truncateTableValue(get(assignmentResponse, 'owner.full_name', ''))}
							</h3>
						</div>
					</Flex>
				);

				return isMobileWidth() ? (
					<Spacer margin="bottom-small">{renderTitle()}</Spacer>
				) : (
					renderTitle()
				);

			case 'pupil_collection_block_count':
				return get(
					assignmentResponse,
					'pupil_collection_blocks_aggregate.aggregate.count',
					''
				);

			case 'updated_at':
				return formatDate(cellData);

			case 'collection_title':
				return (cellData || []).length === 0 ? (
					''
				) : (
					<Link
						to={buildLink(APP_PATH.ASSIGNMENT_RESPONSES.route, {
							id: assignmentResponse.id,
						})}
					>
						{cellData}
					</Link>
				);

			case 'actions':
				return renderDeleteAction(assignmentResponse);

			default:
				return cellData;
		}
	};

	const renderHeader = () => {
		return (
			<Toolbar
				className={classnames('m-assignment-overview__header-toolbar', {
					'm-assignment-overview__header-toolbar-mobile': isMobileWidth(),
				})}
			>
				<ToolbarLeft>
					<BlockHeading type="h2" className="u-m-0">
						{assignmentResponsesCount} {t('responsen')}
					</BlockHeading>
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
									disabled={!assignmentResponses}
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
			</Toolbar>
		);
	};

	const renderEmptyFallback = () => (
		<>
			{renderHeader()}
			<ErrorView
				icon="clipboard"
				message={t('Er zijn nog geen antwoorden geregistreerd voor deze opdracht')}
			>
				<p>{t('Deel de link van deze opdracht met je leerlingen')}</p>
			</ErrorView>
		</>
	);

	const renderAssignmentResponsesView = () => {
		if (!assignmentResponses) {
			return null;
		}
		if (!assignmentResponses.length) {
			return renderEmptyFallback();
		}
		return (
			<>
				{renderHeader()}
				<Table
					columns={tableColumns}
					data={assignmentResponses}
					emptyStateMessage={
						query.filter
							? t('Er zijn geen antwoorden die voldoen aan de zoekopdracht')
							: t('Er zijn nog geen antwoorden voor deze opdracht geregistreerd')
					}
					renderCell={(rowData: Avo.Assignment.Response_v2, colKey: string) =>
						renderCell(rowData, colKey as AssignmentResponseTableColumns)
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
						pageCount={Math.ceil(assignmentResponsesCount / ITEMS_PER_PAGE)}
						currentPage={query.page || 0}
						onPageChange={(newPage: number) => handleQueryChanged(newPage, 'page')}
					/>
				</Spacer>

				<DeleteObjectModal
					title={t('Ben je zeker dat je deze response wil verwijderen?')}
					body={t(
						'assignment/views/assignment-overview___deze-actie-kan-niet-ongedaan-gemaakt-worden'
					)}
					isOpen={isDeleteAssignmentResponseModalOpen}
					onClose={handleDeleteModalClose}
					deleteObjectCallback={() =>
						deleteCurrentAssignment(get(markedAssignmentResponse, 'id', null))
					}
				/>
			</>
		);
	};

	const renderAssignmentResponsePage = () => {
		return (
			<div className="m-workspace">
				<Container background="alt" mode="vertical" size="small">
					<Container mode="horizontal">
						<Toolbar>
							<ToolbarLeft>
								<BlockHeading type="h2" className="u-m-0">
									{assignment?.title}
								</BlockHeading>
							</ToolbarLeft>
						</Toolbar>
					</Container>
				</Container>

				<Container mode="vertical" size="small">
					<Container mode="horizontal">{renderAssignmentResponsesView()}</Container>
				</Container>
			</div>
		);
	};

	return canEditAssignments !== null ? (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={assignmentResponses}
			render={renderAssignmentResponsePage}
		/>
	) : null;
};

export default AssignmentResponses;
