import { type ButtonAction } from '@viaa/avo2-components';

export interface ContentPageLabel {
	id: number;
	label: string;
	content_type: string;
	link_to: ButtonAction | null;
	created_at: string;
	updated_at: string;
}
