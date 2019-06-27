/**
 * Converts a date from format 2000-12-31 to 31/12/2000
 */
export function formatDate(dateString: string = '', separator: string = '/'): string {
	return dateString
		.split('-')
		.reverse()
		.join(separator);
}
