const basic = {
	allowedTags: [
		'h1',
		'h2',
		'h3',
		'h4',
		'blockquote',
		'p',
		'ul',
		'ol',
		'li',
		'b',
		'i',
		'u',
		'strong',
		'em',
		'strike',
		'br',
		'sub',
		'sup',
		'super',
		'span',
	],
	allowedAttributes: {
		span: ['style'],
		p: ['style'],
	},
};

const link = {
	allowedTags: [...basic.allowedTags, 'a'],
	allowedAttributes: {
		...basic.allowedAttributes,
		a: ['href', 'target'],
	},
};

const full = {
	allowedTags: [...link.allowedTags, 'img', 'table', 'tr', 'td', 'div'],
	allowedAttributes: {
		...link.allowedAttributes,
		table: ['class'],
		td: ['colSpan', 'rowSpan'],
		img: ['src'],
		div: ['class', 'style'],
		span: ['class', 'style'],
	},
};

export type SanitizePreset = 'basic' | 'link' | 'full';

const presetLookup: { [preset in SanitizePreset]: any } = {
	basic,
	link,
	full,
};

export default presetLookup;
