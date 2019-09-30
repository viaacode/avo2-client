// TODO remove once components new version is released
import React, { Fragment, FunctionComponent, ReactNode } from 'react';

import { Icon } from '@viaa/avo2-components';
import { DefaultProps } from '@viaa/avo2-components/dist/types';
import classNames from 'classnames';

export type Column = {
	col?:
		| '1'
		| '2'
		| '3'
		| '4'
		| '5'
		| '6'
		| '7'
		| '8'
		| '9'
		| '10'
		| '11'
		| '12'
		| '13'
		| '14'
		| '15';
	id: string;
	label: string;
	sortable?: boolean;
};

export interface TableProps extends DefaultProps {
	data: any[];
	rowKey: string;
	columns: Column[];
	sortColumn?: string;
	sortOrder?: 'asc' | 'desc';
	styled?: boolean;
	bordered?: boolean;
	emptyStateMessage?: string;
	renderCell?: (row: any, cell: any, rowIndex: number, cellIndex: number) => ReactNode;
	onColumnClick?: (id: string) => void;
}

export const Table: FunctionComponent<TableProps> = ({
	className,
	data = [],
	rowKey,
	columns = [],
	sortColumn,
	sortOrder = 'asc',
	styled,
	bordered,
	emptyStateMessage,
	renderCell = () => null,
	onColumnClick = () => {},
}) => {
	return (
		<Fragment>
			<table
				className={classNames(className, 'c-table', {
					'c-table--styled': styled || bordered,
					'c-table--bordered': bordered,
				})}
			>
				{columns.length > 0 && (
					<thead>
						<tr>
							{columns.map(heading => (
								<th
									key={heading.id}
									className={classNames({ [`o-table-col-${heading.col}`]: heading.col })}
									onClick={() => heading.sortable && onColumnClick(heading.id)}
								>
									{heading.label}
									{heading.sortable && sortColumn === heading.id && (
										<Icon name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} />
									)}
								</th>
							))}
						</tr>
					</thead>
				)}
				{data.length > 0 && (
					<tbody>
						{data.map((row, rowIndex) => (
							<tr key={row[rowKey]}>
								{columns
									.map(col => col.id)
									.map((columnKey, columnIndex) => (
										<td key={columnIndex}>{renderCell(row, columnKey, rowIndex, columnIndex)}</td>
									))}
							</tr>
						))}
					</tbody>
				)}
			</table>
			{data.length === 0 && emptyStateMessage && (
				<p className="u-spacer-top">{emptyStateMessage}</p>
			)}
		</Fragment>
	);
};
