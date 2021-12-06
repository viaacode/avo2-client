import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { isCollection, isItem } from '../../../quick-lane/quick-lane.helpers';
import { QUICK_LANE_COLUMNS } from '../../constants/quick-lane';
import { formatDate, formatTimestamp } from '../../helpers';
import { QuickLaneUrlObject } from '../../types';
import QuickLaneLink from '../QuickLaneLink/QuickLaneLink';

interface QuickLaneFilterTableCellProps {
	id: string;
	data: QuickLaneUrlObject;
}

const QuickLaneFilterTableCell: FunctionComponent<QuickLaneFilterTableCellProps> = ({
	id,
	data,
}) => {
	const [t] = useTranslation();

	switch (id) {
		case QUICK_LANE_COLUMNS.TITLE:
			return data.title.length <= 0 ? (
				<span className="u-text-muted">
					{t('workspace/views/quick-lane-overview___geen')}
				</span>
			) : (
				<span>{data.title}</span>
			);

		case QUICK_LANE_COLUMNS.CONTENT_LABEL:
			let label: string = t('workspace/views/quick-lane-overview___unknown-type');

			if (isCollection(data)) {
				label = t('workspace/views/quick-lane-overview___collectie');
			} else if (isItem(data)) {
				label = t('workspace/views/quick-lane-overview___item');
			}

			return <span>{label}</span>;

		case QUICK_LANE_COLUMNS.URL:
			return <QuickLaneLink short id={data.id} /*label={`${data.id.slice(0, 8)}...`}*/ />;

		case QUICK_LANE_COLUMNS.AUTHOR:
			return <span>{data.owner?.usersByuserId.full_name || '-'}</span>;

		case QUICK_LANE_COLUMNS.CREATED_AT:
		case QUICK_LANE_COLUMNS.UPDATED_AT:
			const date = data[id as 'created_at' | 'updated_at'];
			return <span title={formatTimestamp(date)}>{formatDate(date)}</span>;

		default:
			return null;
	}
};

export default QuickLaneFilterTableCell;
