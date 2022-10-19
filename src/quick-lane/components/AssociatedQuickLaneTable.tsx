import { Table, TableProps } from '@viaa/avo2-components';
import { TableColumnSchema } from '@viaa/avo2-components/dist/esm/components/Table/Table';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import QuickLaneFilterTableCell from '../../shared/components/QuickLaneFilterTableCell/QuickLaneFilterTableCell';
import { QUICK_LANE_COLUMNS } from '../../shared/constants/quick-lane';
import { isMobileWidth } from '../../shared/helpers';
import { QuickLaneUrlObject } from '../../shared/types';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';

interface AssociatedQuickLaneTableProps {}

const AssociatedQuickLaneTable: FunctionComponent<AssociatedQuickLaneTableProps & TableProps> = ({
	onColumnClick,
	sortColumn,
	sortOrder,
	data,
	emptyStateMessage,
}) => {
	const [t] = useTranslation();

	const renderAssociatedQuickLaneTableCell = (data: QuickLaneUrlObject, id: string) => (
		<QuickLaneFilterTableCell id={id} data={data} />
	);

	return (
		<>
			<Table
				columns={
					[
						{
							id: QUICK_LANE_COLUMNS.TITLE,
							label: t('workspace/views/quick-lane-overview___titel'),
							sortable: true,
							dataType: TableColumnDataType.string,
						},
						// Hide timestamps & author on mobile
						...(isMobileWidth()
							? []
							: [
									{
										id: QUICK_LANE_COLUMNS.AUTHOR,
										label: t(
											'workspace/views/quick-lane-overview___aangemaakt-door'
										),
										sortable: true,
										dataType: TableColumnDataType.string,
									},
									{
										id: QUICK_LANE_COLUMNS.ORGANISATION,
										label: t(
											'workspace/views/quick-lane-overview___organisatie'
										),
										sortable: true,
										dataType: TableColumnDataType.string,
									},
									{
										id: QUICK_LANE_COLUMNS.CREATED_AT,
										label: t(
											'workspace/views/quick-lane-overview___aangemaakt-op'
										),
										sortable: true,
										dataType: TableColumnDataType.dateTime,
									},
							  ]),
					] as TableColumnSchema[]
				}
				data={data}
				emptyStateMessage={emptyStateMessage}
				onColumnClick={onColumnClick}
				renderCell={renderAssociatedQuickLaneTableCell}
				sortColumn={sortColumn}
				sortOrder={sortOrder}
				variant="bordered"
				rowKey="id"
			/>
		</>
	);
};

export default AssociatedQuickLaneTable as FunctionComponent<
	AssociatedQuickLaneTableProps & TableProps
>;

export const AssociatedQuickLaneTableOrderBy = {
	[QUICK_LANE_COLUMNS.AUTHOR]: 'owner.user.full_name',
	[QUICK_LANE_COLUMNS.ORGANISATION]: 'owner.organisation.name',
};
