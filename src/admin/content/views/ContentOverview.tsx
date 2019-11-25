import React, { FunctionComponent } from 'react';

import { Button, ButtonToolbar, Table } from '@viaa/avo2-components';

import { DataQueryComponent } from '../../../shared/components';
import { getFullName, getRole } from '../../../shared/helpers';
import { AdminLayout } from '../../shared/layouts';

import { CONTENT_OVERVIEW_TABLE_COLS } from '../content.const';
import { GET_CONTENT } from '../content.gql';
import { ContentOverviewTableCols, ContentSchema } from '../content.types';

interface ContentOverviewProps {}

const ContentOverview: FunctionComponent<ContentOverviewProps> = () => {
	// Render
	const renderTableCell = (rowData: Partial<ContentSchema>, columnId: ContentOverviewTableCols) => {
		switch (columnId) {
			case 'author':
				return getFullName(rowData.user);
			case 'role':
				return getRole(rowData.user || null);
			case 'actions':
				return (
					<ButtonToolbar>
						<Button icon="info" onClick={() => {}} size="small" title="Bekijk content" />
					</ButtonToolbar>
				);

			default:
				return rowData[columnId];
		}
	};

	const renderContentOverview = (data: Partial<ContentSchema>[]) => {
		return (
			<div className="c-table-responsive">
				<Table
					columns={CONTENT_OVERVIEW_TABLE_COLS}
					data={data}
					renderCell={(rowData: Partial<ContentSchema>, columnId: string) =>
						renderTableCell(rowData, columnId as ContentOverviewTableCols)
					}
					rowKey="id"
					variant="bordered"
					emptyStateMessage="Er is nog geen content beschikbaar"
				/>
			</div>
		);
	};

	return (
		<AdminLayout pageTitle="Content overzicht">
			<DataQueryComponent
				renderData={renderContentOverview}
				resultPath="app_content"
				query={GET_CONTENT}
			/>
		</AdminLayout>
	);
};

export default ContentOverview;
