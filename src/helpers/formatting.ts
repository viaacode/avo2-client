import { padStart, reverse } from 'lodash-es';

export function formatDuration(numSeconds: number | null | undefined) {
	const seconds: number = numSeconds || 0;
	return Math.round(seconds / 60) + padStart(String(seconds % 60), 2, '0');
}

/**
 * Converts a date from format 2000-12-31 to 31/12/2000
 */
export function formatDate(dateString: string, separator: string = '/'): string {
	return reverse(dateString.split('-')).join(separator);
}
