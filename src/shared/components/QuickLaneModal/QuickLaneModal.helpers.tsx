import type { Avo } from '@viaa/avo2-types';

import { AssignmentLayout } from '../../../assignment/assignment.types';
import { Lookup_Enum_Assignment_Content_Labels_Enum } from '../../generated/graphql-db-types';
import { QuickLaneUrlObject } from '../../types';

export const isShareable = (content: Avo.Assignment.Content): boolean => {
	return (
		(content as Avo.Item.Item).is_published || (content as Avo.Collection.Collection).is_public
	);
};

export const defaultQuickLaneState: QuickLaneUrlObject = {
	id: '',
	title: '',
	view_mode: AssignmentLayout.PlayerAndText,
};

export const getContentUuid = (
	content: Avo.Assignment.Content,
	contentLabel: Lookup_Enum_Assignment_Content_Labels_Enum
): string => {
	switch (contentLabel) {
		case 'ITEM':
			return (content as Avo.Item.Item).uid;
		default:
			return content.id.toString();
	}
};
