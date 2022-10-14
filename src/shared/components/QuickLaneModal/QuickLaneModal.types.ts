import { AssignmentContent, AssignmentContentLabel } from '@viaa/avo2-types/types/assignment';
import { ReactNode } from 'react';

export interface QuickLaneModalProps {
	content_label?: AssignmentContentLabel;
	content?: AssignmentContent;
	error?: ReactNode;
	isOpen: boolean;
	modalTitle: string;
	onClose?: () => void;
	onUpdate?: (content: AssignmentContent) => void; // TODO investigate typing, since this is also used in collection detail
}
