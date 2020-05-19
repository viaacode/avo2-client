export const WYSIWYG2_OPTIONS_ALIGN = ['separator', 'text-align'];

export const WYSIWYG2_OPTIONS_BASE = [
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
export const WYSIWYG2_OPTIONS_DEFAULT = [...WYSIWYG2_OPTIONS_BASE, 'separator', 'remove-styles'];

// Avo Eind redacteur, Educative Author & Partners
export const WYSIWYG2_OPTIONS_AUTHOR = [
	...WYSIWYG2_OPTIONS_BASE,
	'separator',
	'link',
	'separator',
	'remove-styles',
];

// Admin
export const WYSIWYG2_OPTIONS_FULL = [
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
	'table',
	'separator',
	'remove-styles',
];

export const WYSIWYG2_OPTIONS_FULL_WITHOUT_ALIGN = [
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
	'table',
	'separator',
	'remove-styles',
];

export const WYSIWYG2_OPTIONS_DEFAULT_NO_TITLES = [
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
