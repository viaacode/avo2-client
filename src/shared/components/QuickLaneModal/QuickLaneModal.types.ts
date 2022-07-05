import { AssignmentContent, AssignmentContentLabel } from '@viaa/avo2-types/types/assignment';

export interface QuickLaneModalProps {
	modalTitle: string;
	isOpen: boolean;
	content?: AssignmentContent;
	content_label?: AssignmentContentLabel;
	onClose?: () => void;
	onUpdate?: (content: AssignmentContent) => void; // TODO investigate typing, since this is also used in collection detail
}
