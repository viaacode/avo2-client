import { AssignmentLayout } from '../../assignment/assignment.types';
import { QuickLaneUrlObject, QuickLaneUrlRecord } from '../types';

export const quickLaneUrlRecordToObject = (record: QuickLaneUrlRecord) => {
	const mapped = { ...record } as unknown as QuickLaneUrlObject;

	switch (record.view_mode) {
		case 'full':
			mapped.view_mode = AssignmentLayout.PlayerAndText;
			break;

		case 'without_description':
			mapped.view_mode = AssignmentLayout.OnlyPlayer;
			break;

		default:
			break;
	}

	return mapped;
};
