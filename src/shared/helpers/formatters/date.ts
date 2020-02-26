/**
 * Converts a date from format 2000-12-31 to 31/12/2000
 */
import moment, { Moment } from 'moment';

export function reorderDate(dateString: string | null, separator: string = '/'): string {
	return (dateString || '')
		.substring(0, 10)
		.split('-')
		.reverse()
		.join(separator);
}

export function normalizeTimestamp(timestamp: string): Moment {
	if (
		timestamp.match(
			/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[+-][0-9]{2}:[0-9]{2}/g
		)
	) {
		return moment.parseZone(timestamp);
	}
	return moment(timestamp);
}

/**
 * Convert viaa format to relative date
 * @param timestamp
 */
export function fromNow(timestamp: string | undefined) {
	if (!timestamp) {
		return '';
	}
	return normalizeTimestamp(timestamp).fromNow();
}

export function formatTimestamp(timestamp: string | undefined) {
	if (!timestamp) {
		return '';
	}
	return normalizeTimestamp(timestamp)
		.toDate()
		.toLocaleString();
}

export function formatDate(timestamp: string | undefined | Date) {
	if (!timestamp) {
		return '';
	}
	if (typeof timestamp !== 'string' && timestamp.toLocaleDateString) {
		return timestamp.toLocaleDateString();
	}
	return normalizeTimestamp(timestamp as string)
		.toDate()
		.toLocaleDateString();
}
