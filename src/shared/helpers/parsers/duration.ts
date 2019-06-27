/**
 * Converts a duration in the form: 00:00:00 to number of seconds
 * @param duration
 */
export function parseDuration(duration: string) {
	const parts = duration.split(':');
	return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
}
