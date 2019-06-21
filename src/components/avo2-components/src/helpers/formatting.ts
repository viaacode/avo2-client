export function formatDuration(seconds: number) {
	const min = Math.floor(Math.abs(seconds) / 60);
	const sec = Math.abs(seconds) % 60;
	return `${seconds < 0 ? '-' : ''}${min}:${String(sec).padStart(2, '0')}`;
}

/**
 * Converts a date from format 2000-12-31 to 31/12/2000
 */
export function formatDate(dateString: string, separator: string = '/'): string {
	return dateString
		.split('-')
		.reverse()
		.join(separator);
}
