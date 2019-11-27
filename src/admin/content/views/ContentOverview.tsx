import React, { FunctionComponent, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { Button, ButtonToolbar, Spacer, Table } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ErrorView } from '../../../error/views';
import { DataQueryComponent } from '../../../shared/components';
import { getFullName, getRole, navigate } from '../../../shared/helpers';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';

import { CONTENT_OVERVIEW_TABLE_COLS, CONTENT_PATH } from '../content.const';
import { GET_CONTENT } from '../content.gql';
import { ContentOverviewTableCols } from '../content.types';

interface ContentOverviewProps extends RouteComponentProps {}

const ContentOverview: FunctionComponent<ContentOverviewProps> = ({ history }) => {
	const [contentList, setContentList] = useState<Partial<Avo.Content.Content>[]>([]);
	// Render
	const renderTableCell = (
		rowData: Partial<Avo.Content.Content>,
		columnId: ContentOverviewTableCols
	) => {
		const { id, profile } = rowData;

		switch (columnId) {
			case 'author':
				return getFullName(profile);
			case 'role':
				return getRole(profile || null);
			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							icon="info"
							onClick={() => navigate(history, CONTENT_PATH.CONTENT_DETAIL, { id })}
							size="small"
							title="Bekijk content"
						/>
						<Button
							icon="edit"
							onClick={() => navigate(history, CONTENT_PATH.CONTENT_EDIT, { id })}
							size="small"
							title="Bekijk content"
						/>
					</ButtonToolbar>
				);

			default:
				return rowData[columnId];
		}
	};

	const renderContentOverview = (data: Partial<Avo.Content.Content>[]) => {
		if (data.length) {
			setContentList(data);
		}

		return !data.length ? (
			<ErrorView message="Er is nog geen content aangemaakt.">
				<p>
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores aliquid ab debitis
					blanditiis vitae molestiae delectus earum asperiores mollitia, minima laborum expedita
					ratione quas impedit repudiandae nisi corrupti quis eaque!
				</p>
				<Spacer margin="top">
					<Button
						icon="plus"
						label="Content toevoegen"
						onClick={() => history.push(CONTENT_PATH.CONTENT_CREATE)}
					/>
				</Spacer>
			</ErrorView>
		) : (
			<div className="c-table-responsive">
				<Table
					columns={CONTENT_OVERVIEW_TABLE_COLS}
					data={data}
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
			<AdminLayoutBody>
				<DataQueryComponent
					renderData={renderContentOverview}
					resultPath="app_content"
					query={GET_CONTENT}
				/>
			</AdminLayoutBody>
			<AdminLayoutActions>
				{!!contentList.length ? (
					<Button
						label="Content toevoegen"
						onClick={() => history.push(CONTENT_PATH.CONTENT_CREATE)}
					/>
				) : null}
			</AdminLayoutActions>
		</AdminLayout>
	);
};

export default withRouter(ContentOverview);
