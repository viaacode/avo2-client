import React, { type FC, type ReactNode } from 'react';

import { formatDate, formatTimestamp } from '../../helpers/formatters/date';
import { tHtml } from '../../helpers/translate-html';
import { type QuickLaneUrlObject } from '../../types';
import { QuickLaneTypeEnum } from '../QuickLaneContent/QuickLaneContent.types';
import { QuickLaneLink } from '../QuickLaneLink/QuickLaneLink';

export interface QuickLaneFilterTableCellProps {
	id: string;
	data: Omit<QuickLaneUrlObject, 'view_mode'>;
	actions?: (data?: QuickLaneFilterTableCellProps['data']) => ReactNode;
}

export const QuickLaneFilterTableCell: FC<QuickLaneFilterTableCellProps> = ({
	id,
	data,
	actions = () => null,
}) => {
	const getItemTypeLabel = (data: Pick<QuickLaneUrlObject, 'content_label'>): ReactNode => {
		let label: ReactNode = tHtml('workspace/views/quick-lane-overview___unknown-type');

		if (data.content_label === QuickLaneTypeEnum.COLLECTION) {
			label = tHtml('workspace/views/quick-lane-overview___collectie');
		} else if (data.content_label === QuickLaneTypeEnum.ITEM) {
			label = tHtml('workspace/views/quick-lane-overview___item');
		}

		return label;
	};

	const getItemTimestamp = (data: QuickLaneFilterTableCellProps['data']) => {
		const date = data[id as 'created_at' | 'updated_at'];
		return <span title={formatTimestamp(date)}>{formatDate(date)}</span>;
	};

	switch (id) {
		case 'title':
			return data.title.length <= 0 ? (
				<span className="u-text-muted">
					{tHtml('workspace/views/quick-lane-overview___geen')}
				</span>
			) : (
				<QuickLaneLink id={data.id} label={data.title} />
			);

		case 'content_label':
			return <span>{getItemTypeLabel(data)}</span>;

		case 'author':
			return <span>{data.owner?.user.full_name || '-'}</span>;

		case 'created_at':
		case 'updated_at':
			return getItemTimestamp(data);

		case 'organisation':
			return <span>{data.owner?.organisation?.name || '-'}</span>;

		case 'action':
			return <>{actions(data)}</>;
	}

	return null;
};
