import { get } from 'lodash';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Pagination, Spacer, Table, TableColumn } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { CollectionService } from '../../collection/collection.service';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../shared/components';
import { buildLink, formatDate, formatTimestamp, isMobileWidth } from '../../shared/helpers';
import { truncateTableValue } from '../../shared/helpers/truncate';

const ITEMS_PER_PAGE = 10;

interface OrganisationContentOverviewProps extends DefaultSecureRouteProps {
	numberOfItems: number;
	onUpdate: () => void | Promise<void>;
}

const OrganisationContentOverview: FunctionComponent<OrganisationContentOverviewProps> = ({
	numberOfItems,
	user,
}) => {
	const [t] = useTranslation();

	type OrganisationContentInfo = any; // TODO:

	// State
	const [organisationContent, setOrganisationContent] = useState<
		OrganisationContentInfo[] | null
	>(null);
	const [sortColumn, setSortColumn] = useState<keyof OrganisationContentInfo>('title');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [page, setPage] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	// TODO: Make shared function because also used in assignments
	const onClickColumn = (columnId: keyof Avo.Collection.Collection) => {
		if (sortColumn === columnId) {
			// Change column sort order
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			// Initial column sort order
			setSortColumn(columnId);
			setSortOrder('asc');
		}
	};

	const fetchOrganisationContent = useCallback(async () => {
		try {
			const rawOrganisationContent = await CollectionService.fetchOrganisationContent(
				page * ITEMS_PER_PAGE,
				ITEMS_PER_PAGE,
				{ [sortColumn]: sortOrder },
				user.profile?.organisation?.or_id || 'OR-154dn75'
			);

			setOrganisationContent(rawOrganisationContent);
		} catch (err) {
			console.error('Failed to fetch collections', err, {});
			setLoadingInfo({
				state: 'error',
				message: t(
					'collection/components/collection-or-bundle-overview___het-ophalen-van-de-bundels-is-mislukt'
				),
				actionButtons: ['home'],
			});
		}
	}, [page, sortColumn, sortOrder, t, user]);

	useEffect(() => {
		fetchOrganisationContent();
	}, [fetchOrganisationContent]);

	useEffect(() => {
		if (organisationContent) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [setLoadingInfo, organisationContent]);

	// Render functions
	const getLinkProps = (collection: Avo.Collection.Collection): { to: string; title: string } => {
		const type = get(collection, 'type.label');

		return {
			title: collection.title,
			to: buildLink(
				type === 'collectie'
					? APP_PATH.COLLECTION_DETAIL.route
					: APP_PATH.BUNDLE_DETAIL.route,
				{
					id: collection.id,
				}
			),
		};
	};

	const renderTitle = (collection: Avo.Collection.Collection) => (
		<div className="c-content-header">
			<h3 className="c-content-header__header">
				<Link {...getLinkProps(collection)}>{truncateTableValue(collection.title)}</Link>
			</h3>
		</div>
	);

	const renderCell = (collection: Avo.Collection.Collection, colKey: string) => {
		switch (colKey) {
			case 'title':
				return renderTitle(collection);

			case 'type':
				const label = get(collection, 'type.label');

				return label.charAt(0).toUpperCase() + label.slice(1) || '-';

			case 'author':
				return get(collection, 'owner.full_name', '-');

			case 'last_edited':
				return get(collection, 'last_editor.full_name', '-');

			case 'created_at':
			case 'updated_at':
				const cellData = collection[colKey as 'created_at' | 'updated_at'];

				return <span title={formatTimestamp(cellData)}>{formatDate(cellData)}</span>;

			default:
				return null;
		}
	};

	const getColumns = (): TableColumn[] => {
		if (isMobileWidth()) {
			return [
				{
					id: 'title',
					label: t('Titel'),
					col: '9',
					dataType: 'string',
				},
				{
					id: 'type',
					label: t('Type'),
					col: '3',
					dataType: 'string',
				},
			];
		}

		return [
			{
				id: 'title',
				label: t('Titel'),
				col: '4',
				dataType: 'string',
			},
			{
				id: 'type',
				label: t('Type'),
				col: '2',
				dataType: 'string',
			},
			{
				id: 'author',
				label: t('Auteur'),
				col: '2',
				dataType: 'string',
			},
			{
				id: 'created_at',
				label: t('Aangemaakt'),
				col: '1',
				dataType: 'dateTime',
			},
			{
				id: 'updated_at',
				label: t('Laatst bewerkt'),
				col: '1',
				dataType: 'dateTime',
			},
			{
				id: 'last_edited',
				label: t('Laatste bewerkt door'),
				col: '2',
				dataType: 'string',
			},
		];
	};

	const renderPagination = () => (
		<Pagination
			pageCount={Math.ceil(numberOfItems / ITEMS_PER_PAGE)}
			currentPage={page}
			onPageChange={setPage}
		/>
	);

	const renderTable = (collections: Avo.Collection.Collection[]) => (
		<>
			<Table
				columns={getColumns()}
				data={collections}
				emptyStateMessage={t(
					'collection/views/collection-overview___geen-resultaten-gevonden'
				)}
				renderCell={renderCell}
				rowKey="id"
				variant="styled"
				onColumnClick={onClickColumn as any}
				// sortColumn={sortColumn} // TODO:
				sortOrder={sortOrder}
			/>
			<Spacer margin="top-large">{renderPagination()}</Spacer>
		</>
	);

	const renderEmptyFallback = () => (
		<ErrorView icon="folder" message={t('Geen content binnen uw organsatie.')} />
	);

	const renderOrganisationContent = () => (
		<>
			{organisationContent && organisationContent.length
				? renderTable(organisationContent)
				: renderEmptyFallback()}
		</>
	);

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={organisationContent}
			render={renderOrganisationContent}
		/>
	);
};

export default OrganisationContentOverview;
