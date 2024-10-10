import { type OrderDirection, PaginationBar } from '@meemoo/react-components';
import {
	Button,
	type ButtonType,
	Flex,
	Form,
	FormGroup,
	IconName,
	Select,
	type SelectOption,
	Spacer,
	Spinner,
	Table,
	type TableColumn,
	TextInput,
	Toolbar,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import classnames from 'classnames';
import { cloneDeep, compact, get, sortBy } from 'lodash-es';
import React, {
	type FunctionComponent,
	type KeyboardEvent,
	type ReactElement,
	type ReactNode,
	useEffect,
	useState,
} from 'react';
import { type RouteComponentProps, withRouter } from 'react-router';
import { useQueryParams } from 'use-query-params';

import { SearchFilter } from '../../../../search/search.const';
import {
	BooleanCheckboxDropdown,
	CheckboxDropdownModal,
	type CheckboxOption,
	DateRangeDropdown,
	DeleteObjectModal,
} from '../../../../shared/components';
import { MultiEducationalOrganisationSelectModal } from '../../../../shared/components/MultiEducationalOrganisationSelectModal/MultiEducationalOrganisationSelectModal';
import { MultiUserSelectDropdown } from '../../../../shared/components/MultiUserSelectDropdown/MultiUserSelectDropdown';
import { eduOrgToClientOrg } from '../../../../shared/helpers/edu-org-string-to-client-org';
import { tHtml } from '../../../../shared/helpers/translate';
import useTranslation from '../../../../shared/hooks/useTranslation';
import { KeyCode } from '../../../../shared/types';
import { GET_DEFAULT_PAGINATION_BAR_PROPS } from '../PaginationBar/PaginationBar.consts';

import { FILTER_TABLE_QUERY_PARAM_CONFIG } from './FilterTable.const';
import { cleanupObject } from './FilterTable.utils';

import './FilterTable.scss';
import { toggleSortOrder } from '../../../../shared/helpers/toggle-sort-order';

export interface FilterableTableState {
	query?: string;
	sort_column: string;
	sort_order: Avo.Search.OrderDirection;
	page: number;
}

export interface FilterableColumn<T = string> extends Omit<TableColumn, 'id'> {
	filterType?:
		| 'CheckboxDropdownModal'
		| 'DateRangeDropdown'
		| 'BooleanCheckboxDropdown'
		| 'OkNokEmptyCheckboxDropdown'
		| 'MultiUserSelectDropdown'
		| 'MultiEducationalOrganisationSelectModal';
	filterProps?: any;
	visibleByDefault: boolean;
	id: T;
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
	defaultOrderDirection?: OrderDirection;

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
	const { tText } = useTranslation();

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
			sort_order: toggleSortOrder(tableState.sort_order),
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
								icon={IconName.search}
								onChange={setSearchTerm}
								onKeyUp={handleKeyUp}
								value={searchTerm}
							/>
						</FormGroup>
						<FormGroup inlineMode="shrink">
							<Button
								label={tText(
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
													label={col.label}
													{...(col.filterProps || {})}
													id={col.id}
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

										case 'MultiEducationalOrganisationSelectModal': {
											const orgs: string[] = (tableState as any)[col.id];
											const orgObjs: Avo.EducationOrganization.Organization[] =
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
										}

										default:
											return null;
									}
								})}
								{!!bulkActions && !!bulkActions.length && (
									<Select
										options={bulkActions}
										onChange={handleSelectBulkAction}
										placeholder={tText(
											'admin/shared/components/filter-table/filter-table___bulkactie'
										)}
										disabled={!bulkActions.find((action) => !action.disabled)}
										className="c-bulk-action-select"
									/>
								)}
							</Flex>
						</ToolbarLeft>
						{!hideTableColumnsButton && (
							<ToolbarRight>
								<CheckboxDropdownModal
									label={tText(
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
									((tableState.sort_order as Avo.Search.OrderDirection) ||
										defaultOrderDirection ||
										undefined) as any // TODO add asc_nulls_first to table sort orders
								}
								showCheckboxes={
									(!!bulkActions && !!bulkActions.length) || showCheckboxes
								}
								selectedItemIds={selectedItemIds || undefined}
								onSelectionChanged={onSelectionChanged}
								onSelectAll={onSelectAll}
							/>
							<Spacer margin="top-large">
								<PaginationBar
									{...GET_DEFAULT_PAGINATION_BAR_PROPS()}
									startItem={(tableState.page || 0) * itemsPerPage}
									itemsPerPage={itemsPerPage}
									totalItems={dataCount}
									onPageChange={(newPage: number) =>
										handleTableStateChanged(newPage, 'page')
									}
									onScrollToTop={() => {
										const filterTable =
											document.querySelector('.c-filter-table');
										const scrollable = filterTable?.closest('.c-scrollable');
										scrollable?.scrollTo(0, 0);
									}}
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
					title={tText(
						'admin/shared/components/filter-table/filter-table___ben-je-zeker-dat-je-deze-actie-wil-uitvoeren'
					)}
					body={tHtml(
						'admin/shared/components/filter-table/filter-table___opgelet-deze-actie-kan-niet-meer-ongedaan-worden'
					)}
					isOpen={confirmBulkActionModalOpen}
					confirmCallback={handleConfirmSelectBulkAction}
					onClose={() => setConfirmBulkActionModalOpen(false)}
					confirmLabel={get(
						bulkActions.find((action) => action.value === selectedBulkAction),
						'label',
						tText('admin/shared/components/filter-table/filter-table___bevestig')
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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { page, sort_column, sort_order, ...filters } = tableState;

	return cleanupObject(filters);
}
