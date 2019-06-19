import { padStart, reverse } from 'lodash-es';

export function formatDuration(numSeconds: number) {
	return Math.round(numSeconds / 60) + padStart(String(numSeconds % 60), 2, '0');
}

/**
 * Converts a date from format 2000-12-31 to 31/12/2000
 */
export function formatDate(dateString: string): string {
	return reverse(dateString.split('-')).join('/');
}
