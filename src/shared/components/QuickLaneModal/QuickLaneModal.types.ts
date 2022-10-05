import { AssignmentContent } from '@viaa/avo2-types/types/assignment';

import { Lookup_Enum_Assignment_Content_Labels_Enum } from '../../generated/graphql-db-types';

export interface QuickLaneModalProps {
	modalTitle: string;
	isOpen: boolean;
	content?: AssignmentContent;
	content_label?: Lookup_Enum_Assignment_Content_Labels_Enum;
	onClose?: () => void;
	onUpdate?: (content: AssignmentContent) => void; // TODO investigate typing, since this is also used in collection detail
}
