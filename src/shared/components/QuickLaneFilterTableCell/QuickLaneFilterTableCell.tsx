import React, { FC, ReactNode } from 'react';

import { isCollection, isItem } from '../../../quick-lane/quick-lane.helpers';
import useTranslation from '../../../shared/hooks/useTranslation';
import { QUICK_LANE_COLUMNS } from '../../constants/quick-lane';
import { formatDate, formatTimestamp } from '../../helpers';
import { QuickLaneUrlObject } from '../../types';
import QuickLaneLink from '../QuickLaneLink/QuickLaneLink';

interface QuickLaneFilterTableCellProps {
	id: string;
	data: QuickLaneUrlObject;
	actions?: (data?: QuickLaneUrlObject) => ReactNode;
}

const QuickLaneFilterTableCell: FC<QuickLaneFilterTableCellProps> = ({
	id,
	data,
	actions = () => null,
}) => {
	const { tHtml } = useTranslation();

	const getItemTypeLabel = (data: Pick<QuickLaneUrlObject, 'content_label'>): ReactNode => {
		let label: ReactNode = tHtml('workspace/views/quick-lane-overview___unknown-type');

		if (isCollection(data)) {
			label = tHtml('workspace/views/quick-lane-overview___collectie');
		} else if (isItem(data)) {
			label = tHtml('workspace/views/quick-lane-overview___item');
		}

		return label;
	};

	const getItemTimestamp = (data: QuickLaneUrlObject) => {
		const date = data[id as 'created_at' | 'updated_at'];
		return <span title={formatTimestamp(date)}>{formatDate(date)}</span>;
	};

	switch (id) {
		case QUICK_LANE_COLUMNS.TITLE:
			return data.title.length <= 0 ? (
				<span className="u-text-muted">
					{tHtml('workspace/views/quick-lane-overview___geen')}
				</span>
			) : (
				<QuickLaneLink id={data.id} label={data.title} />
			);

		case QUICK_LANE_COLUMNS.CONTENT_LABEL:
			return <span>{getItemTypeLabel(data)}</span>;

		case QUICK_LANE_COLUMNS.AUTHOR:
			return <span>{data.owner?.user.full_name || '-'}</span>;

		case QUICK_LANE_COLUMNS.CREATED_AT:
		case QUICK_LANE_COLUMNS.UPDATED_AT:
			return getItemTimestamp(data);

		case QUICK_LANE_COLUMNS.ORGANISATION:
			return <span>{data.owner?.organisation?.name || '-'}</span>;

		case QUICK_LANE_COLUMNS.ACTIONS:
			return <>{actions(data)}</>;
	}

	return null;
};

export default QuickLaneFilterTableCell;
