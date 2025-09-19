import { toggleSortOrder } from '@meemoo/admin-core-ui/dist/admin.mjs';
import { PaginationBar } from '@meemoo/react-components';
import { IconName, Spacer, Table, type TableColumn } from '@viaa/avo2-components';
import { useAtomValue } from 'jotai';
import React, { type FC, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { GET_DEFAULT_PAGINATION_BAR_PROPS } from '../../admin/shared/components/PaginationBar/PaginationBar.consts';
import { commonUserAtom } from '../../authentication/authentication.store';
import {
	CollectionService,
	type OrganisationContentItem,
} from '../../collection/collection.service';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';
import { OrderDirection } from '../../search/search.const';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { buildLink } from '../../shared/helpers/build-link';
import { formatDate, formatTimestamp } from '../../shared/helpers/formatters';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { truncateTableValue } from '../../shared/helpers/truncate';
import { useTranslation } from '../../shared/hooks/useTranslation';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';

// Constants

const ITEMS_PER_PAGE = 10;

// Typing

interface OrganisationContentOverviewProps {
	numberOfItems: number;
	onUpdate: () => void | Promise<void>;
}

// Component

export const OrganisationContentOverview: FC<OrganisationContentOverviewProps> = ({
	numberOfItems,
}) => {
	const { tText, tHtml } = useTranslation();
	const commonUser = useAtomValue(commonUserAtom);

	// State
	const [organisationContent, setOrganisationContent] = useState<
		OrganisationContentItem[] | null
	>(null);
	const [sortColumn, setSortColumn] = useState<keyof OrganisationContentItem>('title');
	const [sortOrder, setSortOrder] = useState<OrderDirection>(OrderDirection.desc);
	const [page, setPage] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	// TODO: Make shared function because also used in assignments
	const onClickColumn = (columnId: keyof OrganisationContentItem) => {
		if (sortColumn === columnId) {
			// Change column sort order
			setSortOrder(toggleSortOrder(sortOrder));
		} else {
			// Initial column sort order
			setSortColumn(columnId);
			setSortOrder(OrderDirection.asc);
		}
	};

	const fetchOrganisationContent = useCallback(async () => {
		try {
			const organisationId = commonUser?.organisation?.or_id || 'NONE';

			const items: OrganisationContentItem[] =
				await CollectionService.fetchOrganisationContent(
					page * ITEMS_PER_PAGE,
					ITEMS_PER_PAGE,
					{ [sortColumn]: sortOrder },
					organisationId
				);

			setOrganisationContent(items);
		} catch (err) {
			console.error('Failed to fetch organisation content', err, {
				organisation: commonUser?.organisation,
			});

			setLoadingInfo({
				state: 'error',
				message: tHtml(
					'workspace/views/organisation-content-overview___het-ophalen-van-de-organisatieinhoud-is-mislukt'
				),
				actionButtons: ['home'],
			});
		}
	}, [page, sortColumn, sortOrder, tHtml, commonUser]);

	useEffect(() => {
		fetchOrganisationContent();
	}, [fetchOrganisationContent]);

	useEffect(() => {
		if (organisationContent) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [setLoadingInfo, organisationContent, commonUser]);

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
				return tText('workspace/views/organisation-content-overview___audio');
			case 'bundel':
				return tText('workspace/views/organisation-content-overview___bundel');
			case 'collectie':
				return tText('workspace/views/organisation-content-overview___collectie');
			case 'video':
				return tText('workspace/views/organisation-content-overview___video');
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
			case 'updated_at': {
				const date = item[colKey as 'created_at' | 'updated_at'];

				return <span title={formatTimestamp(date)}>{formatDate(date)}</span>;
			}

			default:
				return null;
		}
	};

	const getColumns = (): TableColumn[] => {
		if (isMobileWidth()) {
			return [
				{
					id: 'title',
					label: tText('workspace/views/organisation-content-overview___titel'),
					col: '6',
					dataType: TableColumnDataType.string,
				},
				{
					id: 'type',
					label: tText('workspace/views/organisation-content-overview___type'),
					col: '3',
					dataType: TableColumnDataType.string,
				},
				{
					id: 'author',
					label: tText('workspace/views/organisation-content-overview___auteur'),
					col: '3',
					dataType: TableColumnDataType.string,
				},
			];
		}

		return [
			{
				id: 'title',
				label: tText('workspace/views/organisation-content-overview___titel'),
				col: '4',
				dataType: TableColumnDataType.string,
			},
			{
				id: 'type',
				label: tText('workspace/views/organisation-content-overview___type'),
				col: '2',
				dataType: TableColumnDataType.string,
			},
			{
				id: 'author',
				label: tText('workspace/views/organisation-content-overview___auteur'),
				col: '2',
				dataType: TableColumnDataType.string,
			},
			{
				id: 'created_at',
				label: tText('workspace/views/organisation-content-overview___aangemaakt'),
				col: '1',
				dataType: TableColumnDataType.dateTime,
			},
			{
				id: 'updated_at',
				label: tText('workspace/views/organisation-content-overview___laatst-bewerkt'),
				col: '1',
				dataType: TableColumnDataType.dateTime,
			},
			{
				id: 'last_edited',
				label: tText(
					'workspace/views/organisation-content-overview___laatste-bewerkt-door'
				),
				col: '2',
				dataType: TableColumnDataType.string,
			},
		];
	};

	const renderPagination = () => (
		<PaginationBar
			{...GET_DEFAULT_PAGINATION_BAR_PROPS()}
			startItem={page * ITEMS_PER_PAGE}
			itemsPerPage={ITEMS_PER_PAGE}
			totalItems={numberOfItems}
			onPageChange={setPage}
		/>
	);

	const renderTable = (items: OrganisationContentItem[]) => (
		<>
			<Table
				columns={getColumns()}
				data={items}
				emptyStateMessage={tText(
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
			icon={IconName.folder}
			message={tHtml(
				'workspace/views/organisation-content-overview___geen-content-binnen-uw-organsatie'
			)}
		/>
	);

	const renderNoOrganisationFallback = () => (
		<ErrorView
			message={tHtml(
				'workspace/views/organisation-content-overview___u-hebt-geen-organisatie'
			)}
		>
			<p>
				{tHtml('workspace/views/organisation-content-overview___u-hebt-geen-organisatie')}
			</p>
		</ErrorView>
	);

	const renderOrganisationContent = () => {
		return (
			<>
				{commonUser?.organisation?.or_id // hasOrganisation
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
