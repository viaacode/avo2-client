import React, { FunctionComponent, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button, ButtonToolbar, Container, Pagination, Spacer, Table } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { ErrorView } from '../../../error/views';
import { DataQueryComponent } from '../../../shared/components';
import { buildLink, formatDate, getFullName, getRole, navigate } from '../../../shared/helpers';
import { useTableSort } from '../../../shared/hooks';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';

import { ContentFilters } from '../components';
import {
	CONTENT_OVERVIEW_TABLE_COLS,
	CONTENT_PATH,
	CONTENT_RESULT_PATH,
	ITEMS_PER_PAGE,
} from '../content.const';
import { GET_CONTENT } from '../content.gql';
import { ContentOverviewTableCols } from '../content.types';
import { useContentCount } from '../hooks';

interface ContentOverviewProps extends DefaultSecureRouteProps {}

const ContentOverview: FunctionComponent<ContentOverviewProps> = ({ history }) => {
	// Hooks
	const [contentList, setContentList] = useState<Partial<Avo.Content.Content>[]>([]);
	const [page, setPage] = useState<number>(0);

	const [contentCount] = useContentCount();
	const [sortColumn, sortOrder, handleSortClick] = useTableSort<ContentOverviewTableCols>(
		'updated_at'
	);

	const [t] = useTranslation();

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
							title={t('admin/content/views/content-overview___bekijk-content')}
							type="tertiary"
						/>
						<Button
							icon="edit"
							onClick={() => navigate(history, CONTENT_PATH.CONTENT_EDIT, { id })}
							size="small"
							title={t('admin/content/views/content-overview___pas-content-aan')}
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
					<Trans i18nKey="admin/content/views/content-overview___beschrijving-hoe-content-toe-te-voegen">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores aliquid ab debitis
						blanditiis vitae molestiae delectus earum asperiores mollitia, minima laborum expedita
						ratione quas impedit repudiandae nisi corrupti quis eaque!
					</Trans>
				</p>
				<Spacer margin="top">
					<Button
						icon="plus"
						label={t('admin/content/views/content-overview___content-toevoegen')}
						onClick={() => history.push(CONTENT_PATH.CONTENT_CREATE)}
					/>
				</Spacer>
			</ErrorView>
		) : (
			<>
				<ContentFilters />
				<div className="c-table-responsive u-spacer-bottom">
					<Table
						columns={CONTENT_OVERVIEW_TABLE_COLS}
						data={data}
						renderCell={(rowData: Partial<Avo.Content.Content>, columnId: string) =>
							renderTableCell(rowData, columnId as ContentOverviewTableCols)
						}
						emptyStateMessage="Er is nog geen content beschikbaar"
						onColumnClick={columId => handleSortClick(columId as ContentOverviewTableCols)}
						rowKey="id"
						sortColumn={sortColumn}
						sortOrder={sortOrder}
						variant="bordered"
					/>
				</div>
				<Pagination
					pageCount={Math.ceil(contentCount / ITEMS_PER_PAGE)}
					onPageChange={setPage}
					currentPage={page}
				/>
			</>
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
							variables={{
								offset: page * ITEMS_PER_PAGE,
								order: { [sortColumn]: sortOrder },
							}}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
			<AdminLayoutActions>
				{!!contentList.length ? (
					<Button
						label={t('admin/content/views/content-overview___content-toevoegen')}
						onClick={() => history.push(CONTENT_PATH.CONTENT_CREATE)}
					/>
				) : null}
			</AdminLayoutActions>
		</AdminLayout>
	);
};

export default ContentOverview;
