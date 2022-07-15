import { AssignmentContent, AssignmentContentLabel } from '@viaa/avo2-types/types/assignment';
import { CollectionSchema } from '@viaa/avo2-types/types/collection';
import { ItemSchema } from '@viaa/avo2-types/types/item';

import { AssignmentLayout } from '../../../assignment/assignment.types';
import { QuickLaneUrlObject } from '../../types';

export const isShareable = (content: AssignmentContent): boolean => {
	return (content as ItemSchema).is_published || (content as CollectionSchema).is_public;
};

export const defaultQuickLaneState: QuickLaneUrlObject = {
	id: '',
	title: '',
	view_mode: AssignmentLayout.PlayerAndText,
};

export const getContentUuid = (
	content: AssignmentContent,
	contentLabel: AssignmentContentLabel
): string => {
	switch (contentLabel) {
		case 'ITEM':
			return (content as ItemSchema).uid;
		default:
			return content.id.toString();
	}
};
