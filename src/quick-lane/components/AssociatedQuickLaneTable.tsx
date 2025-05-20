import { Table, type TableColumn, type TableProps } from '@viaa/avo2-components';
import React, { type FC } from 'react';

import QuickLaneFilterTableCell from '../../shared/components/QuickLaneFilterTableCell/QuickLaneFilterTableCell';
import { isMobileWidth } from '../../shared/helpers/media-query';
import useTranslation from '../../shared/hooks/useTranslation';
import { type QuickLaneUrlObject } from '../../shared/types';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';

const AssociatedQuickLaneTable: FC<TableProps> = ({
	onColumnClick,
	sortColumn,
	sortOrder,
	data,
	emptyStateMessage,
}) => {
	const { tText } = useTranslation();

	const renderAssociatedQuickLaneTableCell = (data: QuickLaneUrlObject, id: string) => (
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
					] as (Omit<TableColumn, 'id'> & { id: string })[]
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

export default AssociatedQuickLaneTable as FC<TableProps>;

export const AssociatedQuickLaneTableOrderBy: Partial<Record<string, string>> = {
	author: 'owner.user.full_name',
	organisation: 'owner.organisation.name',
};
