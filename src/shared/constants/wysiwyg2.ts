import { WYSIWYG2Control } from '@viaa/avo2-components';

export const WYSIWYG2_OPTIONS_ALIGN: WYSIWYG2Control[] = ['separator', 'text-align'];

export const WYSIWYG2_OPTIONS_BASE: (WYSIWYG2Control[] | WYSIWYG2Control)[] = [
	'undo',
	'redo',
	'separator',
	'headings',
	'separator',
	'bold',
	'italic',
	'strike-through',
	'underline',
	WYSIWYG2_OPTIONS_ALIGN,
	'separator',
	'list-ul',
	'list-ol',
];

// LL & LK
export const WYSIWYG2_OPTIONS_DEFAULT: (WYSIWYG2Control[] | WYSIWYG2Control)[] = [
	...WYSIWYG2_OPTIONS_BASE,
	'separator',
	'remove-styles',
];

// Avo Eind redacteur, Educative Author & Partners
export const WYSIWYG2_OPTIONS_AUTHOR: (WYSIWYG2Control[] | WYSIWYG2Control)[] = [
	...WYSIWYG2_OPTIONS_BASE,
	'separator',
	'link',
	'separator',
	'remove-styles',
];

// Admin
export const WYSIWYG2_OPTIONS_FULL: (WYSIWYG2Control[] | WYSIWYG2Control)[] = [
	...WYSIWYG2_OPTIONS_BASE,
	'separator',
	'subscript',
	'superscript',
	'separator',
	'hr',
	'separator',
	'link',
	// 'media',
	'separator',
	'table' as WYSIWYG2Control, // TODO: Remove "as WYSIWYG2Control" when components 1.42.0 is released.
	'separator',
	'remove-styles',
];

export const WYSIWYG2_OPTIONS_FULL_WITHOUT_ALIGN: (WYSIWYG2Control[] | WYSIWYG2Control)[] = [
	'undo',
	'redo',
	'separator',
	'headings',
	'separator',
	'bold',
	'italic',
	'strike-through',
	'underline',
	'separator',
	'list-ul',
	'list-ol',
	'separator',
	'subscript',
	'superscript',
	'separator',
	'hr',
	'separator',
	'link',
	// 'media',
	'separator',
	'table' as WYSIWYG2Control, // TODO: Remove "as WYSIWYG2Control" when components 1.42.0 is released.
	'separator',
	'remove-styles',
];

export const WYSIWYG2_OPTIONS_DEFAULT_NO_TITLES: (WYSIWYG2Control[] | WYSIWYG2Control)[] = [
	'undo',
	'redo',
	'separator',
	'bold',
	'italic',
	'strike-through',
	'underline',
	'separator',
	'list-ul',
	'list-ol',
	'separator',
	'subscript',
	'superscript',
	'separator',
	'hr',
	'separator',
	'remove-styles',
];
