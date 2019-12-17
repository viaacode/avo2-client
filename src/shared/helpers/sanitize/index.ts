import sanitizeHtml from 'sanitize-html';

import sanitizePresets from './presets';

const sanitize = (input: string, preset = sanitizePresets.basic) =>
	sanitizeHtml(input, {
		...preset,
	});

export { sanitize, sanitizePresets };
