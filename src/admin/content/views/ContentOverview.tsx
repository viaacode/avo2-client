import React, { FunctionComponent } from 'react';

import { Button, ButtonToolbar, Spacer, Table } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ErrorView } from '../../../error/views';
import { DataQueryComponent } from '../../../shared/components';
import { getFullName, getRole } from '../../../shared/helpers';
import { AdminLayout } from '../../shared/layouts';

import { CONTENT_OVERVIEW_TABLE_COLS } from '../content.const';
import { GET_CONTENT } from '../content.gql';
import { ContentOverviewTableCols } from '../content.types';

interface ContentOverviewProps {}

const ContentOverview: FunctionComponent<ContentOverviewProps> = () => {
	// Render
	const renderTableCell = (
		rowData: Partial<Avo.Content.Content>,
		columnId: ContentOverviewTableCols
	) => {
		switch (columnId) {
			case 'author':
				return getFullName(rowData.profile);
			case 'role':
				return getRole(rowData.profile || null);
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

	const renderContentOverview = (content: Partial<Avo.Content.Content>[]) => {
		return !content.length ? (
			<ErrorView message="Er is nog geen content aangemaakt.">
				<p>
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores aliquid ab debitis
					blanditiis vitae molestiae delectus earum asperiores mollitia, minima laborum expedita
					ratione quas impedit repudiandae nisi corrupti quis eaque!
				</p>
				<Spacer margin="top">
					<Button icon="plus" label="Content toevoegen" />
				</Spacer>
			</ErrorView>
		) : (
			<div className="c-table-responsive">
				<Table
					columns={CONTENT_OVERVIEW_TABLE_COLS}
					data={content}
					renderCell={(rowData: Partial<Avo.Content.Content>, columnId: string) =>
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
