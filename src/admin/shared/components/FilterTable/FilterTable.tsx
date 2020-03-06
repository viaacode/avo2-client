import { compact, fromPairs, isArray, isEmpty, isNil, isObject, isString, omitBy } from 'lodash-es';
import React, { FunctionComponent, KeyboardEvent, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumberParam, QueryParamConfig, StringParam, useQueryParams } from 'use-query-params';

import {
	Button,
	FormGroup,
	Pagination,
	Spacer,
	Table,
	TextInput,
	useTableSort,
} from '@viaa/avo2-components';
import { TableColumn } from '@viaa/avo2-components/src/components/Table/Table'; // TODO use exported version components repo

import { KeyCode } from '../../../../shared/types';
import { ContentOverviewTableCols } from '../../../content/content.types';

import './FilterTable.scss';

export interface FilterableColumn<T> extends TableColumn {
	filterComponent?: FunctionComponent<any>;
	queryParamConverter?: QueryParamConfig<T>;
}

interface FilterTableProps {
	data: any[];
	dataCount: number;
	itemsPerPage: number;
	columns: FilterableColumn<any>[];
	searchTextPlaceholder: string;
	noContentMatchingFiltersMessage: string;
	noContentMessage: string;
	defaultSortColumn: string;
	renderTableCell: (
		rowData: any,
		columnId: string,
		rowIndex: number,
		columnIndex: number
	) => ReactNode;
	className?: string;
	onFilterChanged: (filters: { [id: string]: any }) => void;
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
	renderTableCell,
	className,
}) => {
	const [t] = useTranslation();

	const [sortColumn, sortOrder, handleSortClick] = useTableSort(defaultSortColumn);

	// Holds the text while the user is typing, once they press the search button or enter it will be copied to the tableState.query
	// This avoids doing a database query on every key press
	const [searchTerm, setSearchTerm] = useState<string>('');

	// Build an object containing the filterable columns, so they can be converted to and from the query params
	const [tableState, setTableState] = useQueryParams({
		page: NumberParam,
		...fromPairs(
			compact(
				columns.map((col): [string, QueryParamConfig<any>] | null => {
					if (col.filterComponent && col.queryParamConverter) {
						return [col.id, col.queryParamConverter];
					}
					return null;
				})
			)
		),
		sort_column: StringParam,
		sort_order: StringParam,
	});

	const handleTableStateChanged = (value: any, id: string) => {
		setTableState(
			cleanupObject({
				...tableState,
				page: 0,
				[id]: value,
			})
		);
	};

	const getFilters = () => {
		const { page, sort_column, sort_order, ...filters } = tableState;
		return cleanupObject(filters);
	};

	// Removes all props where the value is undefined, null, [], {}, ''
	const cleanupObject = (obj: any) => {
		return omitBy(
			obj,
			value =>
				isNil(value) ||
				(isString(value) && !value.length) ||
				((isObject(value) || isArray(value)) && isEmpty(value))
		);
	};

	const handleKeyUp = (e: KeyboardEvent) => {
		if (e.keyCode === KeyCode.Enter) {
			handleTableStateChanged(searchTerm, 'query');
		}
	};

	return (
		<>
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
			{columns.map(col => {
				if (!col.filterComponent || !col.id || !col.queryParamConverter) {
					return null;
				}
				const FilterComponent = col.filterComponent;
				return (
					<FilterComponent
						key={col.id}
						onChange={(newValue: any) =>
							handleTableStateChanged(newValue, col.id as string)
						}
					/>
				);
			})}
			<Table
				className={className}
				columns={columns}
				data={data}
				emptyStateMessage={
					!!getFilters() ? noContentMatchingFiltersMessage : noContentMessage
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
