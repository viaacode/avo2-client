import basic from './basic';

export default {
	allowedTags: [...basic.allowedTags, 'a'],
	allowedAttributes: {
		...basic.allowedAttributes,
		a: ['href', 'target'],
	},
};
