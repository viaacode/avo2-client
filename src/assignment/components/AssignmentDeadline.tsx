import { differenceInHours } from 'date-fns';
import React, { FC, useMemo } from 'react';

import {
	DeadlineIndicator,
	DeadlineIndicatorColors,
	DeadlineIndicatorShapes,
	Flex,
	FlexItem,
} from '@viaa/avo2-components';

import { formatCustomTimestamp } from '../../shared/helpers';

interface AssignmentDeadlineProps {
	deadline?: string | null | Date;
}

const AssignmentDeadline: FC<AssignmentDeadlineProps> = ({ deadline }) => {
	const config: [DeadlineIndicatorColors, DeadlineIndicatorShapes] | undefined = useMemo(() => {
		if (!deadline) return undefined;

		const now = new Date();
		const cast = new Date(deadline);
		const difference = differenceInHours(cast, now);

		if (difference <= 48) {
			return ['error', 'square'];
		}

		if (difference <= 168) {
			return ['yellow', 'diamond'];
		}

		return ['success', 'circle'];
	}, [deadline]);

	if (!config) {
		return null;
	}

	return (
		<Flex center>
			<DeadlineIndicator
				className="u-spacer-right-s"
				color={config[0]}
				shape={config[1]}
			></DeadlineIndicator>

			<FlexItem shrink={false}>
				{formatCustomTimestamp(deadline, 'DD MMMM YYYY HH:mm')}
			</FlexItem>
		</Flex>
	);
};

export default AssignmentDeadline;