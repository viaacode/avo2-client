/*
	TODO:
	Formatting:
		DEFAULT & AUTHOR - H3 & H4
		FULL - Everything
	Table:
		Implement Plug-in and only for FULL
*/

// LL & LK
export const WYSIWYG_OPTIONS_DEFAULT = [
	['undo', 'redo'],
	['bold', 'italic', 'strikethrough', 'underline'],
	['justifyLeft', 'justifyCenter', 'justifyRight'],
	['unorderedList', 'orderedList'],
	['fullscreen'],
	['removeformat'],
];

// Educative Author & Partners
export const WYSIWYG_OPTIONS_AUTHOR = [...WYSIWYG_OPTIONS_DEFAULT, ['viewHTML'], ['link']];

// Admin
export const WYSIWYG_OPTIONS_FULL = [
	...WYSIWYG_OPTIONS_AUTHOR,
	['superscript', 'subscript'],
	['insertImage'],
	['horizontalRule'],
];
