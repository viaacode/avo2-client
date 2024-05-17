import { type Avo } from '@viaa/avo2-types';
import { type ReactNode } from 'react';

export type QuickLaneType = 'COLLECTIE' | 'ITEM';

export interface QuickLaneModalProps {
	content_label?: QuickLaneType;
	content?: Avo.Assignment.Assignment | Avo.Collection.Collection | Avo.Item.Item;
	error?: ReactNode;
	isOpen: boolean;
	modalTitle: string | ReactNode;
	onClose?: () => void;
	onUpdate?: (content: Avo.Assignment.Content) => void; // TODO investigate typing, since this is also used in collection detail
}
