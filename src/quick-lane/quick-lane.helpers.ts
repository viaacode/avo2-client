import { AssignmentContentLabel } from '@viaa/avo2-types/types/assignment';

import { QuickLaneUrlObject } from '../shared/types';

type ContentLabelObject = Pick<QuickLaneUrlObject, 'content_label'>;

// Check type of content
const is = (object: ContentLabelObject | undefined, type: AssignmentContentLabel): boolean => {
	if (object === undefined) {
		return false;
	}

	return object.content_label === type;
};

export const isItem = (object: ContentLabelObject | undefined): boolean => {
	return is(object, 'ITEM');
};

export const isCollection = (object: ContentLabelObject | undefined): boolean => {
	return is(object, 'COLLECTIE');
};
