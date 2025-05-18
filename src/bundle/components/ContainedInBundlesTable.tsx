import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import { Button, Icon, IconName, Spacer, Table } from '@viaa/avo2-components';
import React, { type FC, type ReactNode, useState } from 'react';
import { withRouter } from 'react-router';
import { type RouteComponentProps } from 'react-router-dom';
import { compose } from 'redux';

import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { type ParentBundle } from '../../collection/collection.types';
import {
	type BundleColumnId,
	BundleSortProp,
	useGetCollectionsOrBundlesContainingFragment,
} from '../../collection/hooks/useGetCollectionsOrBundlesContainingFragment';
import { APP_PATH } from '../../constants';
import { OrderDirection } from '../../search/search.const';
import { buildLink } from '../../shared/helpers/build-link';
import { ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';
import { toggleSortOrder } from '../../shared/helpers/toggle-sort-order';
import { tText } from '../../shared/helpers/translate-text';
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

	const renderBundleCell = (parentBundle: ParentBundle, columnId: BundleColumnId): ReactNode => {
		switch (columnId) {
			case 'author':
				return parentBundle.author || '-';

			case 'organisation':
				return parentBundle?.organisation || '-';

			case 'is_public':
				return (
					<div
						title={
							parentBundle.is_public
								? tText(
										'collection/components/collection-or-bundle-overview___publiek'
								  )
								: tText(
										'collection/components/collection-or-bundle-overview___niet-publiek'
								  )
						}
					>
						<Icon name={parentBundle.is_public ? IconName.unlock3 : IconName.lock} />
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
							navigateToBundleDetail(parentBundle.id as string);
						}}
					/>
				);

			default:
				return parentBundle[columnId];
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
							label: tText(
								'bundle/components/contained-in-bundles-table___organisatie'
							),
							id: 'organisation',
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
