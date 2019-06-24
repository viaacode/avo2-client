import { padStart, reverse } from 'lodash-es';

export function formatDuration(numSeconds: number | null | undefined) {
	const seconds: number = Math.abs(numSeconds || 0);
	const min = Math.floor(seconds / 60);
	const sec = seconds % 60;
	return `${min}:${padStart(String(sec), 2, '0')}`;
}

/**
 * Converts a date from format 2000-12-31 to 31/12/2000
 */
export function formatDate(dateString: string, separator: string = '/'): string {
	return reverse(dateString.split('-')).join(separator);
}

/**
 * Converts a duration in the form: 00:00:00 to number of seconds
 * @param duration
 */
export function parseDuration(duration: string) {
	const parts = duration.split(':');
	return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
}
