import sanitizeHtml from 'sanitize-html';

import sanitizePresets, { SanitizePreset } from './presets';

const sanitize = (input: string, preset: SanitizePreset) =>
	sanitizeHtml(input, sanitizePresets[preset] || sanitizePresets['basic']);

export { sanitize, sanitizePresets };
