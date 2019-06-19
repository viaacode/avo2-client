import { padStart, reverse } from 'lodash-es';

export function formatDuration(numSeconds: number | null | undefined) {
	const seconds: number = numSeconds || 0;
	const min = Math.round(seconds / 60);
	const sec = seconds % 60;
	return `${min}:${padStart(String(sec), 2, '0')}`;
}

/**
 * Converts a date from format 2000-12-31 to 31/12/2000
 */
export function formatDate(dateString: string, separator: string = '/'): string {
	return reverse(dateString.split('-')).join(separator);
}
