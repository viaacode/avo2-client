import React, { FunctionComponent, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button, ButtonToolbar, Container, Spacer, Table } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { ErrorView } from '../../../error/views';
import { DataQueryComponent } from '../../../shared/components';
import { buildLink, formatDate, getFullName, getRole, navigate } from '../../../shared/helpers';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';

import { CONTENT_OVERVIEW_TABLE_COLS, CONTENT_PATH, CONTENT_RESULT_PATH } from '../content.const';
import { GET_CONTENT } from '../content.gql';
import { ContentOverviewTableCols } from '../content.types';
import { Trans } from 'react-i18next';

interface ContentOverviewProps extends DefaultSecureRouteProps {}

const ContentOverview: FunctionComponent<ContentOverviewProps> = ({ history }) => {
	const [contentList, setContentList] = useState<Partial<Avo.Content.Content>[]>([]);

	// Render
	const renderTableCell = (
		rowData: Partial<Avo.Content.Content>,
		columnId: ContentOverviewTableCols
	) => {
		const { id, profile, title } = rowData;

		switch (columnId) {
			case 'title':
				return <Link to={buildLink(CONTENT_PATH.CONTENT_DETAIL, { id })}>{title}</Link>;
			case 'author':
				return getFullName(profile) || '-';
			case 'role':
				return getRole(profile) || '-';
			case 'publish_at':
			case 'depublish_at':
			case 'created_at':
			case 'updated_at':
				return !!rowData[columnId] ? formatDate(rowData[columnId] as string) : '-';
			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							icon="info"
							onClick={() => navigate(history, CONTENT_PATH.CONTENT_DETAIL, { id })}
							size="small"
							title="Bekijk content"
							type="tertiary"
						/>
						<Button
							icon="edit"
							onClick={() => navigate(history, CONTENT_PATH.CONTENT_EDIT, { id })}
							size="small"
							title="Pas content aan"
							type="tertiary"
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
					<Trans>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores aliquid ab debitis
						blanditiis vitae molestiae delectus earum asperiores mollitia, minima laborum expedita
						ratione quas impedit repudiandae nisi corrupti quis eaque!
					</Trans>
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
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
						<DataQueryComponent
							renderData={renderContentOverview}
							resultPath={CONTENT_RESULT_PATH.GET}
							query={GET_CONTENT}
						/>
					</Container>
				</Container>
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

export default ContentOverview;
