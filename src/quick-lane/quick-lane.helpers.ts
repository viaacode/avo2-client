import { Lookup_Enum_Assignment_Content_Labels_Enum } from '../shared/generated/graphql-db-types';
import { QuickLaneUrlObject } from '../shared/types';

type ContentLabelObject = Pick<QuickLaneUrlObject, 'content_label'>;

// Check type of content
const is = (
	object: ContentLabelObject | undefined,
	type: Lookup_Enum_Assignment_Content_Labels_Enum
): boolean => {
	if (object === undefined) {
		return false;
	}

	return object.content_label === type;
};

export const isItem = (object: ContentLabelObject | undefined): boolean => {
	return is(object, Lookup_Enum_Assignment_Content_Labels_Enum.Item);
};

export const isCollection = (object: ContentLabelObject | undefined): boolean => {
	return is(object, Lookup_Enum_Assignment_Content_Labels_Enum.Collectie);
};
