import { BlockHeading } from '@meemoo/admin-core-ui';
import {
	Button,
	Flex,
	Form,
	FormGroup,
	IconName,
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
import { PermissionName } from '@viaa/avo2-types';
import type { Avo } from '@viaa/avo2-types';
import classNames from 'classnames';
import { cloneDeep, compact, get, isNil, noop, uniq } from 'lodash-es';
import React, {
	FunctionComponent,
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Link } from 'react-router-dom';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';

import { ItemsService } from '../../admin/items/items.service';
import { cleanupObject } from '../../admin/shared/components/FilterTable/FilterTable.utils';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionService } from '../../authentication/helpers/permission-service';
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
import useTranslation from '../../shared/hooks/useTranslation';
import { NO_RIGHTS_ERROR_MESSAGE } from '../../shared/services/data-service';
import { ToastService } from '../../shared/services/toast-service';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { ITEMS_PER_PAGE } from '../../workspace/workspace.const';
import { GET_ASSIGNMENT_RESPONSE_OVERVIEW_COLUMNS } from '../assignment.const';
import { AssignmentService } from '../assignment.service';
import {
	Assignment_Response_v2,
	Assignment_v2,
	AssignmentOverviewTableColumns,
	AssignmentResponseInfo,
	AssignmentResponseTableColumns,
	AssignmentType,
	BaseBlockWithMeta,
	PupilCollectionFragment,
} from '../assignment.types';
import { canViewAnAssignment } from '../helpers/can-view-an-assignment';
import { isItemWithMeta } from '../helpers/is-item-with-meta';

import './AssignmentOverview.scss';
import './AssignmentResponses.scss';

interface AssignmentResponsesProps
	extends Omit<DefaultSecureRouteProps<{ id: string }>, 'location'> {
	onUpdate: () => void | Promise<void>;
}

const DEFAULT_SORT_COLUMN = 'updated_at';
const DEFAULT_SORT_ORDER = 'desc';

const AssignmentResponses: FunctionComponent<AssignmentResponsesProps> = ({
	onUpdate = noop,
	// history,
	match,
	user,
}) => {
	const { tText, tHtml } = useTranslation();

	// Data
	const [assignment, setAssignment] = useState<Assignment_v2 | null>(null);
	const [assignmentResponses, setAssignmentResponses] = useState<AssignmentResponseInfo[] | null>(
		null
	);
	const [assignmentResponsesCount, setAssigmentResponsesCount] = useState<number>(0);
	const [assignmentResponsesFragments, setAssignmentResponsesFragments] = useState<string[]>([]);

	const assignmentResponsesFragmentsHash = useMemo(
		() => assignmentResponsesFragments.join(),
		[assignmentResponsesFragments]
	);

	// UI
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [filterString, setFilterString] = useState<string>('');
	const [sortColumn, sortOrder, handleColumnClick, setSortColumn, setSortOrder] =
		useTableSort<AssignmentOverviewTableColumns>(DEFAULT_SORT_COLUMN, DEFAULT_SORT_ORDER);

	// Modal
	const [isDeleteAssignmentResponseModalOpen, setDeleteAssignmentResponseModalOpen] =
		useState<boolean>(false);
	const [markedAssignmentResponse, setMarkedAssignmentResponse] =
		useState<Assignment_Response_v2 | null>(null);

	// Permissions
	const [canViewAssignmentResponses, setCanViewAssignmentResponses] = useState<boolean | null>(
		null
	);

	const tableColumns = useMemo(
		() =>
			GET_ASSIGNMENT_RESPONSE_OVERVIEW_COLUMNS(
				(assignment?.lom_learning_resource_type[0] || AssignmentType.KIJK) as AssignmentType
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

	const checkPermissions = useCallback(async () => {
		try {
			if (user) {
				setCanViewAssignmentResponses(
					await PermissionService.hasPermissions(
						[
							PermissionName.VIEW_OWN_ASSIGNMENT_RESPONSES,
							PermissionName.VIEW_ANY_ASSIGNMENT_RESPONSES,
						],
						user
					)
				);
			}
		} catch (err) {
			console.error('Failed to check permissions', err, {
				user,
				permissions: [
					PermissionName.VIEW_OWN_ASSIGNMENT_RESPONSES,
					PermissionName.VIEW_ANY_ASSIGNMENT_RESPONSES,
				],
			});
			ToastService.danger(
				tHtml(
					'shared/components/loading-error-loaded-component/loading-error-loaded-component___er-ging-iets-mis-tijdens-het-controleren-van-de-rechten-van-je-account'
				)
			);
		}
	}, [setCanViewAssignmentResponses, user, tText]);

	const fetchAssignment = useCallback(async () => {
		try {
			if (!canViewAnAssignment(user)) {
				setLoadingInfo({
					message: tText(
						'assignment/views/assignment-responses___je-hebt-geen-rechten-om-deze-opdracht-te-bekijken'
					),
					icon: IconName.lock,
					state: 'error',
				});
			}
			const assignmentId = match.params.id;

			const assignment = await AssignmentService.fetchAssignmentById(assignmentId);

			setAssignment(assignment);
		} catch (err) {
			if (JSON.stringify(err).includes(NO_RIGHTS_ERROR_MESSAGE)) {
				setLoadingInfo({
					message: tText(
						'assignment/views/assignment-responses___je-hebt-geen-rechten-om-deze-opdracht-te-bekijken'
					),
					icon: IconName.lock,
					state: 'error',
				});
				return;
			}
			setLoadingInfo({
				state: 'error',
				message: tText(
					'assignment/views/assignment-responses___het-ophalen-van-de-opdracht-is-mislukt'
				),
			});
		}
	}, [match, tText]);

	const fetchAssignmentResponses = useCallback(async () => {
		try {
			if (isNil(canViewAssignmentResponses)) {
				return;
			}

			const assignmentId = match.params.id;

			const column = tableColumns.find(
				(tableColumn: any) => tableColumn.id || '' === (sortColumn as any)
			);
			const columnDataType = (column?.dataType ||
				TableColumnDataType.string) as TableColumnDataType;

			const response = await AssignmentService.fetchAssignmentResponses(
				assignmentId,
				user,
				sortColumn,
				sortOrder,
				columnDataType,
				query.page || 0,
				query.filter || ''
			);

			// Determine each response's fragments to evaluate their published-status
			const fragmentIds: string[] = compact(
				response.assignmentResponses.flatMap((response) =>
					((response.pupil_collection_blocks as PupilCollectionFragment[]) || []).flatMap(
						(block) => block.fragment_id
					)
				)
			);

			setAssignmentResponses(response.assignmentResponses);
			setAssigmentResponsesCount(response.count);
			setAssignmentResponsesFragments(uniq(fragmentIds));
		} catch (err) {
			setLoadingInfo({
				state: 'error',
				message: tText(
					'assignment/views/assignment-responses___het-ophalen-van-responses-is-mislukt'
				),
			});
		}
	}, [
		canViewAssignmentResponses,
		match.params.id,
		tableColumns,
		user,
		sortColumn,
		sortOrder,
		query.page,
		query.filter,
		tText,
	]);

	const fetchAssignmentResponsesFragments = async (items: string[]) => {
		// Note: duplicate ids don't matter, they're only fetched once
		const fragments = await ItemsService.fetchItemsByExternalIds(items);

		setAssignmentResponses(
			await Promise.all(
				(assignmentResponses || []).map(async (response) => {
					return {
						...response,
						pupil_collection_blocks:
							await AssignmentService.enrichBlocksWithMeta<BaseBlockWithMeta>(
								response.pupil_collection_blocks,
								fragments
							),
					};
				})
			)
		);
	};

	useEffect(() => {
		checkPermissions();
	}, [checkPermissions]);

	useEffect(() => {
		fetchAssignment();
	}, [fetchAssignment, match]);

	useEffect(() => {
		fetchAssignmentResponsesFragments(assignmentResponsesFragments);
	}, [assignmentResponsesFragmentsHash]);

	useEffect(() => {
		if (canViewAssignmentResponses) {
			fetchAssignmentResponses();
		} else if (!isNil(canViewAssignmentResponses)) {
			// canViewAssignmentResponses: false
			setLoadingInfo({
				message: tText(
					'assignment/views/assignment-responses___je-hebt-geen-rechten-om-deze-opdracht-te-bekijken'
				),
				icon: IconName.lock,
				state: 'error',
			});
		}
	}, [canViewAssignmentResponses, fetchAssignmentResponses]);

	useEffect(() => {
		if (!isNil(assignmentResponses) && !isNil(assignmentResponsesCount) && !isNil(assignment)) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [assignmentResponses, assignmentResponsesCount, assignment]);

	const deleteAssignmentResponse = async (assignmentResponseId: string | null) => {
		try {
			if (isNil(assignmentResponseId)) {
				ToastService.danger(
					tHtml(
						'assignment/views/assignment-responses___de-response-kon-niet-verwijderd-worden-geen-geldig-id'
					)
				);
				return;
			}

			await AssignmentService.deleteAssignmentResponse(assignmentResponseId);
			await fetchAssignmentResponses();

			onUpdate();
			ToastService.success(
				tHtml('assignment/views/assignment-responses___de-response-is-verwijderd')
			);
		} catch (err) {
			console.error(err);
			ToastService.danger(
				tHtml(
					'assignment/views/assignment-responses___het-verwijderen-van-de-response-is-mislukt'
				)
			);
		}
	};

	const renderDeleteAction = (assignmentResponse: Assignment_Response_v2) => (
		<Button
			title={tText('workspace/views/bookmarks___verwijder-uit-bladwijzers')}
			ariaLabel={tText('workspace/views/bookmarks___verwijder-uit-bladwijzers')}
			icon={IconName.delete}
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

	const renderDataCell = (value: ReactNode, label?: ReactNode, className?: string) =>
		isMobileWidth() ? (
			<div className={classNames('m-assignment-overview__table__data-cell', className)}>
				<div className="m-assignment-overview__table__data-cell__label">{label}</div>
				<div className="m-assignment-overview__table__data-cell__value">{value}</div>
			</div>
		) : className ? (
			<span className={className}>{value}</span>
		) : (
			value
		);

	const renderCell = (
		assignmentResponse: Assignment_Response_v2,
		colKey: AssignmentResponseTableColumns
	) => {
		const cellData: any = (assignmentResponse as any)[colKey];

		switch (colKey) {
			case 'pupil': {
				const renderAuthor = () => (
					<Flex>
						<div className="c-content-header c-content-header--small">
							<h3 className="c-content-header__header u-m-0">
								{truncateTableValue(get(assignmentResponse, 'owner.full_name', ''))}
							</h3>
						</div>
					</Flex>
				);

				return isMobileWidth() ? (
					<Spacer margin="bottom-small">{renderAuthor()}</Spacer>
				) : (
					renderAuthor()
				);
			}
			case 'pupil_collection_block_count':
				return renderDataCell(
					assignmentResponse.pupil_collection_blocks?.filter(isItemWithMeta).length || '',
					tText('assignment/views/assignment-responses___fragmenten'),
					'c-assignment-responses__block-count'
				);

			case 'updated_at':
				return renderDataCell(
					formatDate(cellData),
					undefined,
					'c-assignment-responses__updated-at'
				);

			case 'collection_title':
				return (
					(cellData || '').length > 0 &&
					renderDataCell(
						<Link
							to={buildLink(APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_DETAIL.route, {
								assignmentId: match.params.id,
								responseId: assignmentResponse.id,
							})}
						>
							{cellData}
						</Link>,
						tText('assignment/views/assignment-responses___leerlingencollectie'),
						'c-assignment-responses__collection-title'
					)
				);

			case 'actions':
				return (
					<div className="c-assignment-responses__actions">
						{renderDeleteAction(assignmentResponse)}
					</div>
				);

			default:
				return cellData;
		}
	};

	const renderHeader = () => {
		return (
			<Toolbar className="m-assignment-overview__header-toolbar">
				<ToolbarLeft>
					<BlockHeading type="h2" className="u-m-0">
						{assignmentResponsesCount}{' '}
						{tText('assignment/views/assignment-responses___responsen')}
					</BlockHeading>
				</ToolbarLeft>
				<ToolbarRight>
					<ToolbarItem>
						<Form type="inline">
							<FormGroup inlineMode="grow">
								<TextInput
									className="c-assignment-overview__search-input"
									icon={IconName.filter}
									value={filterString}
									onChange={setFilterString}
									disabled={!assignmentResponses}
								/>
							</FormGroup>
							<FormGroup inlineMode="grow">
								<Button
									label={tText('search/views/search___zoeken')}
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
				icon={IconName.clipboard}
				message={tHtml(
					'assignment/views/assignment-responses___er-zijn-nog-geen-antwoorden-geregistreerd-voor-deze-opdracht'
				)}
			>
				<p>
					{tHtml(
						'assignment/views/assignment-responses___deel-de-link-van-deze-opdracht-met-je-leerlingen'
					)}
				</p>
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
					className="c-assignment-responses__table"
					columns={tableColumns}
					data={assignmentResponses}
					emptyStateMessage={
						query.filter
							? tText(
									'assignment/views/assignment-responses___er-zijn-geen-antwoorden-die-voldoen-aan-de-zoekopdracht'
							  )
							: tText(
									'assignment/views/assignment-responses___er-zijn-nog-geen-antwoorden-geregistreerd-voor-deze-opdracht'
							  )
					}
					renderCell={(rowData: Assignment_Response_v2, colKey: string) =>
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
					title={tText(
						'assignment/views/assignment-responses___ben-je-zeker-dat-je-deze-response-wil-verwijderen'
					)}
					body={tText(
						'assignment/views/assignment-overview___deze-actie-kan-niet-ongedaan-gemaakt-worden'
					)}
					isOpen={isDeleteAssignmentResponseModalOpen}
					onClose={handleDeleteModalClose}
					confirmCallback={() => {
						deleteAssignmentResponse(get(markedAssignmentResponse, 'id', null));
						handleDeleteModalClose();
					}}
				/>
			</>
		);
	};

	const renderAssignmentResponsePage = () => {
		return <>{renderAssignmentResponsesView()}</>;
	};

	return canViewAssignmentResponses !== null ? (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={assignmentResponses}
			render={renderAssignmentResponsePage}
		/>
	) : null;
};

export default AssignmentResponses;
