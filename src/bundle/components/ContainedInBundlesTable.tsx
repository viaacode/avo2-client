import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import { Button, Icon, IconName, Spacer, Table } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import React, { type FC, type ReactNode, useState } from 'react';
import { withRouter } from 'react-router';
import { type RouteComponentProps } from 'react-router-dom';
import { compose } from 'redux';

import { redirectToClientPage } from '../../authentication/helpers/redirects';
import {
	type BundleColumnId,
	BundleSortProp,
	useGetCollectionsOrBundlesContainingFragment,
} from '../../collection/hooks/useGetCollectionsOrBundlesContainingFragment';
import { APP_PATH } from '../../constants';
import { OrderDirection } from '../../search/search.const';
import { buildLink } from '../../shared/helpers';
import { ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';
import { toggleSortOrder } from '../../shared/helpers/toggle-sort-order';
import { tText } from '../../shared/helpers/translate-text';
import { truncateTableValue } from '../../shared/helpers/truncate';
import withUser from '../../shared/hocs/withUser';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';

type ContainedInBundlesTableProps = {
	fragmentId: string;
	title: string;
	emptyTableLabel: string;
};

const ContainedInBundlesTable: FC<
	ContainedInBundlesTableProps & RouteComponentProps<{ id: string }>
> = ({ history, fragmentId, emptyTableLabel, title }) => {
	const [bundleSortColumn, setBundleSortColumn] = useState<BundleSortProp>(BundleSortProp.title);
	const [bundleSortOrder, setBundleSortOrder] = useState<OrderDirection>(OrderDirection.asc);

	const { data: bundlesContainingThisFragment } = useGetCollectionsOrBundlesContainingFragment(
		fragmentId,
		bundleSortColumn,
		bundleSortOrder
	);

	const navigateToBundleDetail = (id: string) => {
		const link = buildLink(APP_PATH.BUNDLE_DETAIL.route, { id });
		redirectToClientPage(link, history);
	};

	const handleBundleColumnClick = (columnId: BundleColumnId) => {
		if (!Object.values(BundleSortProp).includes(columnId as BundleSortProp)) {
			return;
		}
		const sortOrder = toggleSortOrder(bundleSortOrder);
		setBundleSortColumn(columnId as BundleSortProp);
		setBundleSortOrder(sortOrder);
	};

	const renderBundleCell = (
		rowData: Partial<Avo.Collection.Collection>,
		columnId: BundleColumnId
	): ReactNode => {
		switch (columnId) {
			case 'author': {
				const user = rowData.profile?.user;
				if (user) {
					return truncateTableValue(`${user.first_name} ${user.last_name}`);
				}
				return '-';
			}

			case 'organization':
				return rowData?.profile?.organisation?.name || '-';

			case 'is_public':
				return (
					<div
						title={
							rowData.is_public
								? tText(
										'collection/components/collection-or-bundle-overview___publiek'
								  )
								: tText(
										'collection/components/collection-or-bundle-overview___niet-publiek'
								  )
						}
					>
						<Icon name={rowData.is_public ? IconName.unlock3 : IconName.lock} />
					</div>
				);

			case ACTIONS_TABLE_COLUMN_ID:
				return (
					<Button
						type="borderless"
						icon={IconName.eye}
						title={tText(
							'collection/components/collection-or-bundle-edit-admin___ga-naar-de-bundel-detail-pagina'
						)}
						ariaLabel={tText(
							'collection/components/collection-or-bundle-edit-admin___ga-naar-de-bundel-detail-pagina'
						)}
						onClick={(evt) => {
							evt.stopPropagation();
							navigateToBundleDetail(rowData.id as string);
						}}
					/>
				);

			default:
				return rowData[columnId];
		}
	};

	return (
		<>
			<Spacer margin={['top-extra-large', 'bottom-small']}>
				<BlockHeading type="h2">{title}</BlockHeading>
			</Spacer>
			{!!bundlesContainingThisFragment && !!bundlesContainingThisFragment.length ? (
				<Table
					columns={[
						{
							label: tText(
								'collection/components/collection-or-bundle-edit-admin___titel'
							),
							id: 'title',
							sortable: true,
							dataType: TableColumnDataType.string,
						},
						{
							label: tText(
								'collection/components/collection-or-bundle-edit-admin___auteur'
							),
							id: 'author',
							sortable: true,
							dataType: TableColumnDataType.string,
						},
						{
							label: 'Organisatie',
							id: 'organization',
							sortable: false,
						},
						{
							label: tText('admin/items/items___publiek'),
							id: 'is_public',
							sortable: true,
							dataType: TableColumnDataType.boolean,
						},
						{
							tooltip: tText(
								'collection/components/collection-or-bundle-edit-admin___acties'
							),
							id: ACTIONS_TABLE_COLUMN_ID,
							sortable: false,
						},
					]}
					data={bundlesContainingThisFragment}
					onColumnClick={handleBundleColumnClick as any}
					onRowClick={(coll) => navigateToBundleDetail(coll.id)}
					renderCell={renderBundleCell as any}
					sortColumn={bundleSortColumn}
					sortOrder={bundleSortOrder}
					variant="bordered"
					rowKey="id"
				/>
			) : (
				emptyTableLabel
			)}
		</>
	);
};

export default compose(
	withRouter,
	withUser
)(ContainedInBundlesTable) as FC<ContainedInBundlesTableProps>;
