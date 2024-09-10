import { type Avo } from '@viaa/avo2-types';

import { AssignmentLayout } from '../../../assignment/assignment.types';
import { type QuickLaneUrlObject } from '../../types';

import { type QuickLaneType } from './QuickLaneModal.types';

export const isShareable = (
	content: Avo.Assignment.Assignment | Avo.Collection.Collection | Avo.Item.Item
): boolean => {
	return (
		(content as Avo.Item.Item).is_published || (content as Avo.Collection.Collection).is_public
	);
};

export const defaultQuickLaneState: QuickLaneUrlObject = {
	id: '',
	title: '',
	view_mode: AssignmentLayout.PlayerAndText,
	start_oc: 0,
	end_oc: 0,
};

export const getContentUuid = (
	content: Avo.Assignment.Assignment | Avo.Collection.Collection | Avo.Item.Item,
	contentLabel: QuickLaneType
): string => {
	switch (contentLabel) {
		case 'ITEM':
			return (content as Avo.Item.Item).uid;
		default:
			return content.id.toString();
	}
};
