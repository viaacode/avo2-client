import {
	cloneDeep,
	compact,
	fromPairs,
	isArray,
	isEmpty,
	isNil,
	isObject,
	isString,
	omitBy,
} from 'lodash-es';
import React, { FunctionComponent, KeyboardEvent, ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumberParam, QueryParamConfig, StringParam, useQueryParams } from 'use-query-params';

import {
	Button,
	Flex,
	Form,
	FormGroup,
	Pagination,
	Spacer,
	Table,
	TextInput,
	useTableSort,
} from '@viaa/avo2-components';
import { TableColumn } from '@viaa/avo2-components/src/components/Table/Table'; // TODO use exported version components repo
import { Avo } from '@viaa/avo2-types';

import { CheckboxDropdownModal, DateRangeDropdown } from '../../../../shared/components';
import { CheckboxOption } from '../../../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import { KeyCode } from '../../../../shared/types';
import { ContentOverviewTableCols } from '../../../content/content.types';

export interface FilterableTableState {
	query?: string;
	sort_column: string;
	sort_order: Avo.Search.OrderDirection;
	page: number;
}

export interface FilterableColumn extends TableColumn {
	filterType?: 'CheckboxDropdownModal' | 'DateRangeDropdown';
	props?: any;
	queryParamConverter?: QueryParamConfig<any>;
}

interface FilterTableProps {
	data: any[];
	dataCount: number;
	itemsPerPage: number;
	columns: FilterableColumn[];
	searchTextPlaceholder: string;
	noContentMatchingFiltersMessage: string;
	noContentMessage: string;
	defaultSortColumn: string;
	defaultSortOrder?: Avo.Search.OrderDirection;
	renderTableCell: (
		rowData: any,
		columnId: string,
		rowIndex: number,
		columnIndex: number
	) => ReactNode;
	className?: string;
	onTableStateChanged: (tableState: { [id: string]: any }) => void;
}

export const FilterTable: FunctionComponent<FilterTableProps> = ({
	data,
	dataCount,
	itemsPerPage,
	columns,
	searchTextPlaceholder,
	noContentMatchingFiltersMessage,
	noContentMessage,
	defaultSortColumn,
	defaultSortOrder = 'desc',
	renderTableCell,
	className,
	onTableStateChanged,
}) => {
	const [t] = useTranslation();

	const [sortColumn, sortOrder, handleSortClick] = useTableSort(
		defaultSortColumn,
		defaultSortOrder
	);

	// Holds the text while the user is typing, once they press the search button or enter it will be copied to the tableState.query
	// This avoids doing a database query on every key press
	const [searchTerm, setSearchTerm] = useState<string>('');

	// Build an object containing the filterable columns, so they can be converted to and from the query params
	const [tableState, setTableState] = useQueryParams({
		page: NumberParam,
		...cleanupObject(
			fromPairs(
				compact(
					columns.map((col): [string, QueryParamConfig<any>] | null => {
						if (col.filterType && col.queryParamConverter) {
							return [col.id, col.queryParamConverter];
						}
						return null;
					})
				)
			)
		),
		sort_column: StringParam,
		sort_order: StringParam,
	});

	const handleTableStateChanged = (value: any, id: string) => {
		let newTableState: any = cloneDeep(tableState);
		newTableState = cleanupObject({
			...newTableState,
			page: 0,
			[id]: value,
		});

		setTableState(newTableState);
	};

	useEffect(() => {
		onTableStateChanged(tableState);
	}, [tableState, onTableStateChanged]);

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
								label={t('Zoeken')}
								type="primary"
								onClick={() => handleTableStateChanged(searchTerm, 'query')}
							/>
						</FormGroup>
					</Form>
				</Spacer>

				<Spacer margin="bottom">
					<Flex spaced="regular" wrap>
						{columns.map(col => {
							if (!col.filterType || !col.id || !col.queryParamConverter) {
								return null;
							}

							switch (col.filterType) {
								case 'CheckboxDropdownModal':
									return (
										<CheckboxDropdownModal
											{...col.props}
											onChange={value =>
												handleTableStateChanged(value, col.id)
											}
											options={(col.props.options || []).map(
												(option: CheckboxOption) => ({
													...option,
													checked: (
														(tableState as any)[col.id] || []
													).includes(option.id),
												})
											)}
										/>
									);

								case 'DateRangeDropdown':
									return (
										<DateRangeDropdown
											id="content-filter-created-date"
											label={t(
												'admin/content/components/content-filters/content-filters___aanmaakdatum'
											)}
											onChange={value =>
												handleTableStateChanged(value, col.id)
											}
											range={(tableState as any)[col.id]}
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
		<>
			{renderFilters()}
			<Table
				className={className}
				columns={columns}
				data={data}
				emptyStateMessage={
					!!getFilters(tableState) ? noContentMatchingFiltersMessage : noContentMessage
				}
				onColumnClick={columnId => handleSortClick(columnId as ContentOverviewTableCols)}
				renderCell={renderTableCell}
				rowKey="id"
				variant="bordered"
				sortColumn={sortColumn}
				sortOrder={sortOrder}
			/>
			<Spacer margin="top-large">
				<Pagination
					pageCount={Math.ceil(dataCount / itemsPerPage)}
					currentPage={tableState.page}
					onPageChange={newPage => handleTableStateChanged(newPage, 'page')}
				/>
			</Spacer>
		</>
	);
};

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
		value =>
			isNil(value) ||
			(isString(value) && !value.length) ||
			((isObject(value) || isArray(value)) && isEmpty(value))
	);
}
