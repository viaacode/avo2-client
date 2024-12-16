import { Button, ButtonToolbar, IconName } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { get, isNil, truncate } from 'lodash-es';
import React, { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { buildLink, formatDate } from '../../../shared/helpers';
import { ACTIONS_TABLE_COLUMN_ID } from '../../../shared/helpers/table-column-list-to-csv-column-list';
import { tText } from '../../../shared/helpers/translate';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import { ADMIN_PATH } from '../../admin.const';
import type { ItemsOverviewTableCols } from '../items.types';

export function renderItemsOverviewTableCell(
	rowData: Partial<Avo.Item.Item>,
	columnId: ItemsOverviewTableCols,
	info: {
		getItemDetailLink: (externalId: string | undefined) => string;
		getItemAdminDetailLink: (uid: string | undefined) => string;
	}
): ReactNode {
	switch (columnId) {
		case 'external_id':
			return (
				<Link to={buildLink(ADMIN_PATH.ITEM_DETAIL, { id: rowData.uid })}>
					{truncate((rowData as any)[columnId] || '-', { length: 60 })}
				</Link>
			);

		case 'updated_at':
		case 'depublish_at':
		case 'expiry_date':
		case 'issued':
		case 'publish_at':
		case 'published_at':
			return !isNil(rowData[columnId]) ? formatDate(rowData[columnId] as any) : '-';

		case 'organisation':
			return truncateTableValue(get(rowData, 'organisation.name'));

		case 'type':
			return get(rowData, 'type.label', '-');

		case 'views':
			return get(rowData, 'item_counts.views') || '0';

		case 'in_collection':
			return get(rowData, 'item_counts.in_collection') || '0';

		case 'bookmarks':
			return get(rowData, 'item_counts.bookmarks') || '0';

		case 'in_assignment':
			return get(rowData, 'item_counts.in_assignment') || '0';

		case 'quick_lane_links':
			return get(rowData, 'item_counts.quick_lane_links') || '0';

		case 'is_deleted':
			return rowData[columnId] ? 'Ja' : 'Nee';

		case 'is_published':
			if (rowData.is_published) {
				return tText('admin/items/views/items-overview___gepubliceerd');
			}
			if (rowData.depublish_reason) {
				return tText('admin/items/views/items-overview___gedepubliceerd-pancarte');
			}
			if (get(rowData, 'relations[0]')) {
				return tText('admin/items/views/items-overview___gedepubliceerd-merge');
			}
			return tText('admin/items/views/items-overview___gedepubliceerd');

		case ACTIONS_TABLE_COLUMN_ID:
			return (
				<ButtonToolbar>
					<Link to={info.getItemDetailLink(rowData.external_id)}>
						<Button
							type="secondary"
							icon={IconName.eye}
							title={tText(
								'admin/items/views/items-overview___bekijk-item-in-de-website'
							)}
							ariaLabel={tText(
								'admin/items/views/items-overview___bekijk-item-in-de-website'
							)}
						/>
					</Link>
					<Link to={info.getItemAdminDetailLink(rowData.uid)}>
						<Button
							type="secondary"
							icon={IconName.edit}
							title={tText(
								'admin/items/views/items-overview___bekijk-item-details-in-het-beheer'
							)}
							ariaLabel={tText(
								'admin/items/views/items-overview___bekijk-item-details-in-het-beheer'
							)}
						/>
					</Link>
				</ButtonToolbar>
			);

		default:
			return truncate((rowData as any)[columnId] || '-', { length: 60 });
	}
}

export function renderItemsOverviewTableCellText(
	item: Partial<Avo.Item.Item>,
	columnId: ItemsOverviewTableCols
): string {
	switch (columnId) {
		case 'external_id':
			return item.external_id || '';

		case 'updated_at':
		case 'depublish_at':
		case 'expiry_date':
		case 'issued':
		case 'publish_at':
		case 'published_at':
			return !isNil(item[columnId]) ? formatDate(item[columnId] as any) : '';

		case 'organisation':
			return item?.organisation?.name || '';

		case 'type':
			return item?.type?.label || '';

		case 'views':
			return String(item?.item_counts?.views || 0);

		case 'in_collection':
			return String(item?.item_counts?.in_collection || 0);

		case 'bookmarks':
			return String(item?.item_counts?.bookmarks || 0);

		case 'in_assignment':
			return String(item?.item_counts?.in_assignment || 0);

		case 'quick_lane_links':
			return String((item?.item_counts as any)?.quick_lane_links || 0);

		case 'is_deleted':
			return item.is_deleted ? 'Ja' : 'Nee';

		case 'is_published':
			if (item.is_published) {
				return tText('admin/items/views/items-overview___gepubliceerd');
			}
			if (item.depublish_reason) {
				return tText('admin/items/views/items-overview___gedepubliceerd-pancarte');
			}
			if (get(item, 'relations[0]')) {
				return tText('admin/items/views/items-overview___gedepubliceerd-merge');
			}
			return tText('admin/items/views/items-overview___gedepubliceerd');

		case ACTIONS_TABLE_COLUMN_ID:
			return '';

		default:
			return (item as any)[columnId] || '';
	}
}
