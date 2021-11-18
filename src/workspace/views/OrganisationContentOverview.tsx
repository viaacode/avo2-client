import { get } from 'lodash';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Pagination, Spacer, Table, TableColumn } from '@viaa/avo2-components';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { CollectionService, OrganisationContentItem } from '../../collection/collection.service';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../shared/components';
import { buildLink, formatDate, formatTimestamp, isMobileWidth } from '../../shared/helpers';
import { truncateTableValue } from '../../shared/helpers/truncate';
import i18n from '../../shared/translations/i18n';

// Constants

const ITEMS_PER_PAGE = 10;

// Typing

interface OrganisationContentOverviewProps extends DefaultSecureRouteProps {
	numberOfItems: number;
	onUpdate: () => void | Promise<void>;
}

// Component

const OrganisationContentOverview: FunctionComponent<OrganisationContentOverviewProps> = ({
	numberOfItems,
	user,
}) => {
	const [t] = useTranslation();

	// State
	const [organisationContent, setOrganisationContent] = useState<
		OrganisationContentItem[] | null
	>(null);
	const [sortColumn, setSortColumn] = useState<keyof OrganisationContentItem>('title');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [page, setPage] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	// TODO: Make shared function because also used in assignments
	const onClickColumn = (columnId: keyof OrganisationContentItem) => {
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
			const organisationId = get(user, 'profile.organisation.or_id') || 'NONE';

			const collections: OrganisationContentItem[] = await CollectionService.fetchOrganisationContent(
				page * ITEMS_PER_PAGE,
				ITEMS_PER_PAGE,
				{ [sortColumn]: sortOrder },
				organisationId
			);

			setOrganisationContent(collections);
		} catch (err) {
			console.error('Failed to fetch organsiation content', err, {
				organisation: user.profile?.organisation,
			});

			setLoadingInfo({
				state: 'error',
				message: t(
					'workspace/views/organisation-content-overview___het-ophalen-van-de-organisatieinhoud-is-mislukt'
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
	}, [setLoadingInfo, organisationContent, user]);

	// Render functions
	const getLinkProps = (item: OrganisationContentItem): { to: string; title: string } => {
		const type = item.type.label;

		return {
			title: item.title,
			to: buildLink(
				type === 'collectie'
					? APP_PATH.COLLECTION_DETAIL.route
					: APP_PATH.BUNDLE_DETAIL.route,
				{
					id: item.id,
				}
			),
		};
	};

	const renderTitle = (item: OrganisationContentItem) => (
		<div className="c-content-header">
			<h3 className="c-content-header__header">
				<Link {...getLinkProps(item)}>{truncateTableValue(item.title)}</Link>
			</h3>
		</div>
	);

	const renderType = (item: OrganisationContentItem): string => {
		if (!item.type.label) {
			return '-';
		}

		// Account for `npm run extract-translations`
		switch (item.type.label) {
			case 'audio':
				return t('workspace/views/organisation-content-overview___audio');
			case 'bundel':
				return t('workspace/views/organisation-content-overview___bundel');
			case 'collectie':
				return t('workspace/views/organisation-content-overview___collectie');
			case 'video':
				return t('workspace/views/organisation-content-overview___video');
			default:
				return '-';
		}
	};

	const renderCell = (item: OrganisationContentItem, colKey: string) => {
		switch (colKey) {
			case 'title':
				return renderTitle(item);

			case 'type':
				return renderType(item);

			case 'author':
				return item.owner.full_name;

			case 'last_edited':
				return item.last_editor ? item.last_editor.full_name : '-';

			case 'created_at':
			case 'updated_at':
				const date = item[colKey as 'created_at' | 'updated_at'];

				return <span title={formatTimestamp(date)}>{formatDate(date)}</span>;

			default:
				return null;
		}
	};

	const getColumns = (): TableColumn[] => {
		if (isMobileWidth()) {
			return [
				{
					id: 'title',
					label: t('workspace/views/organisation-content-overview___titel'),
					col: '6',
					dataType: 'string',
				},
				{
					id: 'type',
					label: t('workspace/views/organisation-content-overview___type'),
					col: '3',
					dataType: 'string',
				},
				{
					id: 'author',
					label: t('workspace/views/organisation-content-overview___auteur'),
					col: '3',
					dataType: 'string',
				},
			];
		}

		return [
			{
				id: 'title',
				label: t('workspace/views/organisation-content-overview___titel'),
				col: '4',
				dataType: 'string',
			},
			{
				id: 'type',
				label: t('workspace/views/organisation-content-overview___type'),
				col: '2',
				dataType: 'string',
			},
			{
				id: 'author',
				label: t('workspace/views/organisation-content-overview___auteur'),
				col: '2',
				dataType: 'string',
			},
			{
				id: 'created_at',
				label: t('workspace/views/organisation-content-overview___aangemaakt'),
				col: '1',
				dataType: 'dateTime',
			},
			{
				id: 'updated_at',
				label: t('workspace/views/organisation-content-overview___laatst-bewerkt'),
				col: '1',
				dataType: 'dateTime',
			},
			{
				id: 'last_edited',
				label: t('workspace/views/organisation-content-overview___laatste-bewerkt-door'),
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

	const renderTable = (items: OrganisationContentItem[]) => (
		<>
			<Table
				columns={getColumns()}
				data={items}
				emptyStateMessage={t(
					'collection/views/collection-overview___geen-resultaten-gevonden'
				)}
				renderCell={renderCell}
				rowKey="id"
				variant="styled"
				onColumnClick={onClickColumn as any}
				sortOrder={sortOrder}
			/>
			<Spacer margin="top-large">{renderPagination()}</Spacer>
		</>
	);

	const renderEmptyFallback = () => (
		<ErrorView
			icon="folder"
			message={t(
				'workspace/views/organisation-content-overview___geen-content-binnen-uw-organsatie'
			)}
		/>
	);

	const renderNoOrganisationFallback = () => (
		<ErrorView
			message={i18n.t(
				'workspace/views/organisation-content-overview___u-hebt-geen-organisatie'
			)}
		>
			<p>
				<Trans i18nKey="workspace/views/organisation-content-overview___u-hebt-geen-organisatie">
					U hebt geen organisatie.
				</Trans>
			</p>
		</ErrorView>
	);

	const renderOrganisationContent = () => {
		return (
			<>
				{user.profile?.organisation?.or_id // hasOrganisation
					? organisationContent && organisationContent.length // hasOrganisationContent
						? renderTable(organisationContent)
						: renderEmptyFallback()
					: renderNoOrganisationFallback()}
			</>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={organisationContent}
			render={renderOrganisationContent}
		/>
	);
};

export default OrganisationContentOverview;
