import basic from './basic';

export default {
	allowedTags: [...basic.allowedTags, 'a'],
	allowedAttributes: {
		a: ['href', 'target'],
	},
};
