import {
	Button,
	ButtonType,
	Flex,
	Form,
	FormGroup,
	Pagination,
	Select,
	SelectOption,
	Spacer,
	Spinner,
	Table,
	TableColumn,
	TextInput,
	Toolbar,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { ClientEducationOrganization } from '@viaa/avo2-types/types/education-organizations';
import { SearchOrderDirection } from '@viaa/avo2-types/types/search';
import classnames from 'classnames';
import { cloneDeep, compact, get, sortBy } from 'lodash-es';
import React, {
	FunctionComponent,
	KeyboardEvent,
	ReactElement,
	ReactNode,
	useEffect,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router';
import { useQueryParams } from 'use-query-params';

import { SearchFilter } from '../../../../search/search.const';
import {
	BooleanCheckboxDropdown,
	CheckboxDropdownModal,
	CheckboxOption,
	DateRangeDropdown,
	DeleteObjectModal,
} from '../../../../shared/components';
import { MultiEducationalOrganisationSelectModal } from '../../../../shared/components/MultiEducationalOrganisationSelectModal/MultiEducationalOrganisationSelectModal';
import { MultiUserSelectDropdown } from '../../../../shared/components/MultiUserSelectDropdown/MultiUserSelectDropdown';
import { eduOrgToClientOrg } from '../../../../shared/helpers/edu-org-string-to-client-org';
import { KeyCode } from '../../../../shared/types';

import { FILTER_TABLE_QUERY_PARAM_CONFIG } from './FilterTable.const';
import { cleanupObject } from './FilterTable.utils';

import './FilterTable.scss';

export interface FilterableTableState {
	query?: string;
	sort_column: string;
	sort_order: Avo.Search.OrderDirection;
	page: number;
}

export interface FilterableColumn extends TableColumn {
	filterType?:
		| 'CheckboxDropdownModal'
		| 'DateRangeDropdown'
		| 'BooleanCheckboxDropdown'
		| 'OkNokEmptyCheckboxDropdown'
		| 'MultiUserSelectDropdown'
		| 'MultiEducationalOrganisationSelectModal';
	filterProps?: any;
	visibleByDefault: boolean;
}

interface FilterTableProps extends RouteComponentProps {
	data: any[];
	dataCount: number;
	itemsPerPage: number;
	columns: FilterableColumn[];
	searchTextPlaceholder: string;
	noContentMatchingFiltersMessage: string;
	renderNoResults: () => ReactElement;
	renderCell: (
		rowData: any,
		columnId: string,
		rowIndex: number,
		columnIndex: number
	) => ReactNode;
	className?: string;
	onTableStateChanged: (tableState: { [id: string]: any }) => void;
	onRowClick?: (rowData: any) => void;
	rowKey?: string | ((row: any) => string);
	variant?: 'bordered' | 'invisible' | 'styled';
	isLoading?: boolean;
	defaultOrderProp?: string;
	defaultOrderDirection?: 'asc' | 'desc';

	// Used for automatic dropdown with bulk actions
	bulkActions?: (SelectOption<string> & { confirm?: boolean; confirmButtonType?: ButtonType })[];
	onSelectBulkAction?: (action: string) => void;

	// Used for manual handling of selected rows
	showCheckboxes?: boolean;
	selectedItemIds?: (string | number)[] | null;
	onSelectionChanged?: (selectedItemIds: (string | number)[]) => void;
	onSelectAll?: () => void;
	hideTableColumnsButton?: boolean;
}

const FilterTable: FunctionComponent<FilterTableProps> = ({
	data,
	dataCount,
	itemsPerPage,
	columns,
	searchTextPlaceholder,
	noContentMatchingFiltersMessage,
	renderNoResults,
	renderCell,
	className,
	onTableStateChanged,
	onRowClick,
	rowKey = 'id',
	variant = 'bordered',
	isLoading = false,
	bulkActions,
	onSelectBulkAction,
	showCheckboxes,
	selectedItemIds,
	onSelectionChanged,
	onSelectAll,
	hideTableColumnsButton,
	defaultOrderProp,
	defaultOrderDirection,
}) => {
	const [t] = useTranslation();

	// Holds the text while the user is typing, once they press the search button or enter it will be copied to the tableState.query
	// This avoids doing a database query on every key press
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [selectedBulkAction, setSelectedBulkAction] = useState<string | null>(null);
	const [confirmBulkActionModalOpen, setConfirmBulkActionModalOpen] = useState<boolean>(false);
	const [tableState, setTableState] = useQueryParams(FILTER_TABLE_QUERY_PARAM_CONFIG(columns));

	useEffect(() => {
		onTableStateChanged(tableState);
		setSearchTerm(tableState.query || '');
	}, [onTableStateChanged, tableState]);

	const handleTableStateChanged = (value: any, id: string) => {
		let newTableState: any = cloneDeep(tableState);

		newTableState = cleanupObject({
			...newTableState,
			[id]: value,
			...(id !== 'page' ? { page: 0 } : {}), // Reset the page to 0, when any filter or sort order change is made
		});

		setTableState(newTableState, 'replace');
	};

	const handleSortOrderChanged = (columnId: string) => {
		let newTableState: any = cloneDeep(tableState);

		newTableState = cleanupObject({
			...newTableState,
			page: 0,
			sort_column: columnId,
			sort_order: tableState.sort_order === 'asc' ? 'desc' : 'asc',
		});

		setTableState(newTableState, 'replace');
	};

	const handleKeyUp = (e: KeyboardEvent) => {
		if (e.keyCode === KeyCode.Enter) {
			handleTableStateChanged(searchTerm, SearchFilter.query);
		}
	};

	const handleSelectBulkAction = (selectedAction: string) => {
		const bulkActionInfo = (bulkActions || []).find(
			(action) => action.value === selectedAction
		);

		if (bulkActionInfo && onSelectBulkAction) {
			if (bulkActionInfo.confirm) {
				setSelectedBulkAction(selectedAction);
				setConfirmBulkActionModalOpen(true);
			} else {
				onSelectBulkAction(selectedAction);
				setSelectedBulkAction(null);
			}
		}
	};

	const handleConfirmSelectBulkAction = () => {
		setConfirmBulkActionModalOpen(false);
		if (onSelectBulkAction && selectedBulkAction) {
			onSelectBulkAction(selectedBulkAction);
			setSelectedBulkAction(null);
		}
	};

	const getColumnOptions = (): CheckboxOption[] => {
		// Get columns from query string list of columns, or use columns visible by default
		return sortBy(
			columns.map((column) => ({
				id: column.id,
				label: column.label || column.tooltip || '',
				checked:
					tableState.columns && tableState.columns.length
						? tableState.columns.includes(column.id)
						: column.visibleByDefault,
			})),
			(option) => option.label
		);
	};

	const getSelectedColumns = (): FilterableColumn[] => {
		if (!!tableState.columns && !!tableState.columns.length) {
			// Return the columns in the order they are specified in the query params
			return compact(
				tableState.columns.map((columnId: string) => {
					return columns.find((column) => column.id === columnId);
				})
			);
		}

		return columns.filter((column) => column.visibleByDefault);
	};

	const updateSelectedColumns = (selectedColumns: string[]) => {
		// Order the selected columns from the modal according to the default order in the column const array
		// This way, when a user selects columns, they will be in the default order
		// But if an array is set by modifying the query params, then the order from the query params will be kept
		handleTableStateChanged(
			columns
				.filter((column) => selectedColumns.includes(column.id))
				.map((column) => column.id),
			'columns'
		);
	};

	const renderFilters = () => {
		const page = tableState.page || 0;
		const from = page * itemsPerPage + 1;
		const to = Math.min(page * itemsPerPage + itemsPerPage, dataCount);

		return (
			<>
				<Spacer margin="bottom">
					<Form type="inline">
						<FormGroup className="c-content-filters__search" inlineMode="grow">
							<TextInput
								placeholder={searchTextPlaceholder}
								icon="search"
								onChange={setSearchTerm}
								onKeyUp={handleKeyUp}
								value={searchTerm}
							/>
						</FormGroup>
						<FormGroup inlineMode="shrink">
							<Button
								label={t(
									'admin/shared/components/filter-table/filter-table___zoeken'
								)}
								type="primary"
								onClick={() =>
									handleTableStateChanged(searchTerm, SearchFilter.query)
								}
							/>
						</FormGroup>
						<Spacer margin="left-small">
							<p className="c-body-1 u-text-muted">
								{from}-{to} van {dataCount} resultaten
							</p>
						</Spacer>
					</Form>
				</Spacer>

				<Spacer margin="bottom">
					<Toolbar className="c-filter-table__toolbar">
						<ToolbarLeft>
							<Flex spaced="regular" wrap>
								{columns.map((col) => {
									if (!col.filterType || !col.id) {
										return null;
									}

									switch (col.filterType) {
										case 'CheckboxDropdownModal':
											return (
												<CheckboxDropdownModal
													{...(col.filterProps || {})}
													id={col.id}
													label={col.label}
													onChange={(value) =>
														handleTableStateChanged(value, col.id)
													}
													options={get(
														col,
														'filterProps.options',
														[]
													).map((option: CheckboxOption) => ({
														...option,
														checked: (
															(tableState as any)[col.id] || []
														).includes(option.id),
													}))}
													key={`filter-${col.id}`}
												/>
											);

										case 'DateRangeDropdown':
											return (
												<DateRangeDropdown
													{...(col.filterProps || {})}
													id={col.id}
													label={col.label}
													onChange={(value) =>
														handleTableStateChanged(value, col.id)
													}
													range={(tableState as any)[col.id]}
													key={`filter-${col.id}`}
												/>
											);

										case 'BooleanCheckboxDropdown':
											return (
												<BooleanCheckboxDropdown
													{...(col.filterProps || {})}
													id={col.id}
													label={col.label}
													value={(tableState as any)[col.id]}
													onChange={(value) =>
														handleTableStateChanged(value, col.id)
													}
													trueLabel={get(col, 'filterProps.trueLabel')}
													falseLabel={get(col, 'filterProps.falseLabel')}
													includeEmpty={get(
														col,
														'filterProps.includeEmpty'
													)}
													key={`filter-${col.id}`}
												/>
											);

										case 'MultiUserSelectDropdown':
											return (
												<MultiUserSelectDropdown
													{...(col.filterProps || {})}
													id={col.id}
													label={col.label}
													values={(tableState as any)[col.id]}
													onChange={(value) =>
														handleTableStateChanged(value, col.id)
													}
													key={`filter-${col.id}`}
												/>
											);

										case 'MultiEducationalOrganisationSelectModal':
											const orgs: string[] = (tableState as any)[col.id];
											const orgObjs: ClientEducationOrganization[] =
												eduOrgToClientOrg(orgs);
											return (
												<MultiEducationalOrganisationSelectModal
													{...(col.filterProps || {})}
													id={col.id}
													label={col.label || ''}
													values={orgObjs}
													onChange={(value) =>
														handleTableStateChanged(value, col.id)
													}
													key={`filter-${col.id}`}
												/>
											);

										default:
											return null;
									}
								})}
								{!!bulkActions && !!bulkActions.length && (
									<Select
										options={bulkActions}
										onChange={handleSelectBulkAction}
										placeholder={t(
											'admin/shared/components/filter-table/filter-table___bulkactie'
										)}
										disabled={!(selectedItemIds || []).length}
										className="c-bulk-action-select"
									/>
								)}
							</Flex>
						</ToolbarLeft>
						{!hideTableColumnsButton && (
							<ToolbarRight>
								<CheckboxDropdownModal
									label={t(
										'admin/shared/components/filter-table/filter-table___kolommen'
									)}
									id="table_columns"
									options={getColumnOptions()}
									onChange={updateSelectedColumns}
									showSelectedValuesOnCollapsed={false}
									showSearch={false}
								/>
							</ToolbarRight>
						)}
					</Toolbar>
				</Spacer>
			</>
		);
	};

	return (
		<div className={classnames('c-filter-table', className)}>
			{!data.length && !getFilters(tableState) ? (
				renderNoResults()
			) : (
				<>
					{renderFilters()}
					<div className="c-filter-table__loading-wrapper">
						<div style={{ opacity: isLoading ? 0.2 : 1 }}>
							<Table
								columns={getSelectedColumns()}
								data={data}
								emptyStateMessage={noContentMatchingFiltersMessage}
								onColumnClick={(columnId) => {
									handleSortOrderChanged(columnId);
								}}
								onRowClick={onRowClick}
								renderCell={renderCell}
								rowKey={rowKey}
								variant={variant}
								sortColumn={tableState.sort_column || defaultOrderProp || undefined}
								sortOrder={
									(tableState.sort_order as SearchOrderDirection) ||
									defaultOrderDirection ||
									undefined
								}
								showCheckboxes={
									(!!bulkActions && !!bulkActions.length) || showCheckboxes
								}
								selectedItemIds={selectedItemIds || undefined}
								onSelectionChanged={onSelectionChanged}
								onSelectAll={onSelectAll}
							/>
							<Spacer margin="top-large">
								<Pagination
									pageCount={Math.ceil(dataCount / itemsPerPage)}
									currentPage={tableState.page || 0}
									onPageChange={(newPage) =>
										handleTableStateChanged(newPage, 'page')
									}
								/>
							</Spacer>
						</div>
						{isLoading && (
							<Flex center className="c-filter-table__loading">
								<Spacer margin={['top-large', 'bottom-large']}>
									<Spinner size="large" />
								</Spacer>
							</Flex>
						)}
					</div>
				</>
			)}
			{!!bulkActions && !!bulkActions.length && (
				<DeleteObjectModal
					isOpen={confirmBulkActionModalOpen}
					confirmCallback={handleConfirmSelectBulkAction}
					onClose={() => setConfirmBulkActionModalOpen(false)}
					confirmLabel={get(
						bulkActions.find((action) => action.value === selectedBulkAction),
						'label',
						t('admin/shared/components/filter-table/filter-table___bevestig')
					)}
					confirmButtonType={get(
						bulkActions.find((action) => action.value === selectedBulkAction),
						'confirmButtonType'
					)}
				/>
			)}
		</div>
	);
};

export default withRouter(FilterTable);

export function getFilters(tableState: any | undefined) {
	if (!tableState) {
		return tableState;
	}

	const { page, sort_column, sort_order, ...filters } = tableState;

	return cleanupObject(filters);
}
