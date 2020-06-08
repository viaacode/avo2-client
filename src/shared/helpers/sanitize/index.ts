import { default as sanitize } from 'sanitize-html';

import sanitizePresets, { SanitizePreset } from './presets';

const sanitizeHtml = (input: string, preset: SanitizePreset) =>
	sanitize(input, sanitizePresets[preset] || sanitizePresets['basic']);

export { sanitizeHtml, sanitizePresets };
