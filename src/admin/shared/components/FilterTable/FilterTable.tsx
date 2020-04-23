import classnames from 'classnames';
import {
	cloneDeep,
	compact,
	fromPairs,
	get,
	isArray,
	isEmpty,
	isNil,
	isPlainObject,
	isString,
	omitBy,
} from 'lodash-es';
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
import {
	BooleanParam,
	NumberParam,
	QueryParamConfig,
	StringParam,
	useQueryParams,
} from 'use-query-params';

import {
	Button,
	Flex,
	Form,
	FormGroup,
	Pagination,
	Spacer,
	Table,
	TableColumn,
	TextInput,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import {
	BooleanCheckboxDropdown,
	CheckboxDropdownModal,
	CheckboxOption,
	DateRangeDropdown,
} from '../../../../shared/components';
import { KeyCode } from '../../../../shared/types';
import { CheckboxListParam, DateRangeParam } from '../../helpers/query-string-converters';

import './FilterTable.scss';

export interface FilterableTableState {
	query?: string;
	sort_column: string;
	sort_order: Avo.Search.OrderDirection;
	page: number;
}

export interface FilterableColumn extends TableColumn {
	filterType?: 'CheckboxDropdownModal' | 'DateRangeDropdown' | 'BooleanCheckboxDropdown';
	filterProps?: any;
}

const FILTER_TYPE_TO_QUERY_PARAM_CONVERTER = {
	CheckboxDropdownModal: CheckboxListParam,
	DateRangeDropdown: DateRangeParam,
	BooleanCheckboxDropdown: BooleanParam,
};

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
	rowKey?: string;
	variant?: 'bordered' | 'invisible' | 'styled';
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
	rowKey = 'id',
	variant = 'bordered',
}) => {
	const [t] = useTranslation();

	// Holds the text while the user is typing, once they press the search button or enter it will be copied to the tableState.query
	// This avoids doing a database query on every key press
	const [searchTerm, setSearchTerm] = useState<string>('');

	// Build an object containing the filterable columns, so they can be converted to and from the query params
	const queryParamConfig: { [queryParamId: string]: QueryParamConfig<any> } = {
		page: NumberParam,
		...cleanupObject(
			fromPairs(
				compact(
					columns.map((col): [string, QueryParamConfig<any>] | null => {
						if (
							col.filterType &&
							FILTER_TYPE_TO_QUERY_PARAM_CONVERTER[col.filterType]
						) {
							return [col.id, FILTER_TYPE_TO_QUERY_PARAM_CONVERTER[col.filterType]];
						}
						return null;
					})
				)
			)
		),
		query: StringParam,
		sort_column: StringParam,
		sort_order: StringParam,
	};
	const [tableState, setTableState] = useQueryParams(queryParamConfig);

	useEffect(() => {
		onTableStateChanged(tableState);
		setSearchTerm(tableState.query);
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
			sort_column: columnId,
			sort_order: tableState.sort_order === 'asc' ? 'desc' : 'asc',
		});

		setTableState(newTableState, 'replace');
	};

	const handleKeyUp = (e: KeyboardEvent) => {
		if (e.keyCode === KeyCode.Enter) {
			handleTableStateChanged(searchTerm, 'query');
		}
	};

	const renderFilters = () => {
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
								onClick={() => handleTableStateChanged(searchTerm, 'query')}
							/>
						</FormGroup>
					</Form>
				</Spacer>

				<Spacer margin="bottom">
					<Flex spaced="regular" wrap>
						{columns.map(col => {
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
											onChange={value =>
												handleTableStateChanged(value, col.id)
											}
											options={get(col, 'filterProps.options', []).map(
												(option: CheckboxOption) => ({
													...option,
													checked: (
														(tableState as any)[col.id] || []
													).includes(option.id),
												})
											)}
											key={`filter-${col.id}`}
										/>
									);

								case 'DateRangeDropdown':
									return (
										<DateRangeDropdown
											{...(col.filterProps || {})}
											id={col.id}
											label={col.label}
											onChange={value =>
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
											onChange={value =>
												handleTableStateChanged(value, col.id)
											}
											key={`filter-${col.id}`}
										/>
									);

								default:
									return null;
							}
						})}
					</Flex>
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
					<Table
						columns={columns}
						data={data}
						emptyStateMessage={noContentMatchingFiltersMessage}
						onColumnClick={columnId => {
							handleSortOrderChanged(columnId);
						}}
						renderCell={renderCell}
						rowKey={rowKey}
						variant={variant}
						sortColumn={tableState.sort_column}
						sortOrder={tableState.sort_order}
					/>
					<Spacer margin="top-large">
						<Pagination
							pageCount={Math.ceil(dataCount / itemsPerPage)}
							currentPage={tableState.page}
							onPageChange={newPage => handleTableStateChanged(newPage, 'page')}
						/>
					</Spacer>
				</>
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

// Removes all props where the value is undefined, null, [], {}, ''
export function cleanupObject(obj: any) {
	return omitBy(
		obj,
		(value: any) =>
			isNil(value) ||
			(isString(value) && !value.length) ||
			((isPlainObject(value) || isArray(value)) && isEmpty(value)) ||
			(isPlainObject(value) && value.gte === '' && value.lte === '')
	);
}
