import type { Avo } from '@viaa/avo2-types';
import { ReactNode } from 'react';

import { Lookup_Enum_Assignment_Content_Labels_Enum } from '../../generated/graphql-db-types';

export interface QuickLaneModalProps {
	content_label?: Lookup_Enum_Assignment_Content_Labels_Enum;
	content?: Avo.Assignment.Content;
	error?: ReactNode;
	isOpen: boolean;
	modalTitle: string | ReactNode;
	onClose?: () => void;
	onUpdate?: (content: Avo.Assignment.Content) => void; // TODO investigate typing, since this is also used in collection detail
}
