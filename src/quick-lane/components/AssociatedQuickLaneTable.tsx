import { Table, TableProps } from '@viaa/avo2-components';
import { TableColumnSchema } from '@viaa/avo2-components/dist/esm/components/Table/Table';
import React, { FunctionComponent } from 'react';

import QuickLaneFilterTableCell from '../../shared/components/QuickLaneFilterTableCell/QuickLaneFilterTableCell';
import { QuickLaneColumn } from '../../shared/constants/quick-lane';
import { isMobileWidth } from '../../shared/helpers';
import useTranslation from '../../shared/hooks/useTranslation';
import { QuickLaneUrlObject } from '../../shared/types';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';

const AssociatedQuickLaneTable: FunctionComponent<TableProps> = ({
	onColumnClick,
	sortColumn,
	sortOrder,
	data,
	emptyStateMessage,
}) => {
	const { tText } = useTranslation();

	const renderAssociatedQuickLaneTableCell = (data: QuickLaneUrlObject, id: QuickLaneColumn) => (
		<QuickLaneFilterTableCell id={id} data={data} />
	);

	return (
		<>
			<Table
				columns={
					[
						{
							id: 'title',
							label: tText('workspace/views/quick-lane-overview___titel'),
							sortable: true,
							dataType: TableColumnDataType.string,
						},
						// Hide timestamps & author on mobile
						...(isMobileWidth()
							? []
							: [
									{
										id: 'author',
										label: tText(
											'workspace/views/quick-lane-overview___aangemaakt-door'
										),
										sortable: true,
										dataType: TableColumnDataType.string,
									},
									{
										id: 'organisation',
										label: tText(
											'workspace/views/quick-lane-overview___organisatie'
										),
										sortable: true,
										dataType: TableColumnDataType.string,
									},
									{
										id: 'created_at',
										label: tText(
											'workspace/views/quick-lane-overview___aangemaakt-op'
										),
										sortable: true,
										dataType: TableColumnDataType.dateTime,
									},
							  ]),
					] as (Omit<TableColumnSchema, 'id'> & { id: QuickLaneColumn })[]
				}
				data={data}
				emptyStateMessage={emptyStateMessage}
				onColumnClick={onColumnClick}
				renderCell={renderAssociatedQuickLaneTableCell as any}
				sortColumn={sortColumn}
				sortOrder={sortOrder}
				variant="bordered"
				rowKey="id"
			/>
		</>
	);
};

export default AssociatedQuickLaneTable as FunctionComponent<TableProps>;

export const AssociatedQuickLaneTableOrderBy: Partial<Record<QuickLaneColumn, string>> = {
	author: 'owner.user.full_name',
	organisation: 'owner.organisation.name',
};
