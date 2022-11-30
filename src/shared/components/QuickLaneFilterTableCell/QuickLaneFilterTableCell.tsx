import React, { FC, ReactNode } from 'react';

import { isCollection, isItem } from '../../../quick-lane/quick-lane.helpers';
import useTranslation from '../../../shared/hooks/useTranslation';
import { QuickLaneColumn } from '../../constants/quick-lane';
import { formatDate, formatTimestamp } from '../../helpers';
import { QuickLaneUrlObject } from '../../types';
import QuickLaneLink from '../QuickLaneLink/QuickLaneLink';

interface QuickLaneFilterTableCellProps {
	id: QuickLaneColumn;
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

export default QuickLaneFilterTableCell;
