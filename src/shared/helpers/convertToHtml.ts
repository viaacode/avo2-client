import marked from 'marked';

// TODO replace this with the function in the components repo once 1.9.1 is released
export function convertToHtml(text: string | undefined | null) {
	return marked(text || '');
}
