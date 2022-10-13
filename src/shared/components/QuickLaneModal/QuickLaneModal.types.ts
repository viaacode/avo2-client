import { AssignmentContent } from '@viaa/avo2-types/types/assignment';
import { ReactNode } from 'react';

import { Lookup_Enum_Assignment_Content_Labels_Enum } from '../../generated/graphql-db-types';

export interface QuickLaneModalProps {
	content_label?: Lookup_Enum_Assignment_Content_Labels_Enum;
	content?: AssignmentContent;
	error?: ReactNode;
	isOpen: boolean;
	modalTitle: string;
	onClose?: () => void;
	onUpdate?: (content: AssignmentContent) => void; // TODO investigate typing, since this is also used in collection detail
}
