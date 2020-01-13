/*
	TODO:
	Formatting:
		DEFAULT & AUTHOR - H3 & H4
		FULL - Everything
	Table:
		Implement Plug-in and only for FULL
*/

const WYSIWYG_OPTIONS_BASE = [
	['undo', 'redo'],
	['bold', 'italic', 'strikethrough', 'underline'],
	['justifyLeft', 'justifyCenter', 'justifyRight'],
	['unorderedList', 'orderedList'],
];

// LL & LK
export const WYSIWYG_OPTIONS_DEFAULT = [...WYSIWYG_OPTIONS_BASE, ['fullscreen'], ['removeformat']];

// Avo Eind redacteur, Educative Author & Partners
export const WYSIWYG_OPTIONS_AUTHOR = [
	...WYSIWYG_OPTIONS_BASE,
	['link'],
	['fullscreen'],
	['viewHTML'],
	['removeformat'],
];

// Admin
export const WYSIWYG_OPTIONS_FULL = [
	...WYSIWYG_OPTIONS_BASE,
	['superscript', 'subscript'],
	['link'],
	['insertImage'],
	['horizontalRule'],
	['fullscreen'],
	['viewHTML'],
	['removeformat'],
];
