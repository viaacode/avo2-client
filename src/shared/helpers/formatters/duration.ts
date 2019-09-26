export function formatDurationMinutesSeconds(numSeconds: number | null | undefined) {
	const seconds: number = Math.abs(numSeconds || 0);
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;

	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDurationHoursMinutesSeconds(numSeconds: number | null | undefined) {
	const seconds: number = Math.abs(numSeconds || 0);
	const hours = Math.floor(seconds / 3600);
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;

	return `${hours.toString().padStart(2, '0')}:${mins
		.toString()
		.padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Converts seconds or a duration string to seconds
 * 00:03:36 =>
 *
 * @param duration
 * @param silent if this function should throw an error or instead return null if the format of the duration is invalid
 */
export function toSeconds(
	duration: number | string | undefined | null,
	silent: boolean = false
): number | null {
	if (!duration) {
		return 0;
	}

	if (typeof duration === 'number') {
		return duration;
	}

	const durationParts = duration.split(':');

	try {
		if (durationParts.length !== 3) {
			throw new Error(
				`Kon het tijdsinterval niet analyseren: "${duration}". Verwacht formaat: uu:mm:ss`
			);
		}

		return (
			parseInt(durationParts[0], 10) * 3600 +
			parseInt(durationParts[1], 10) * 60 +
			parseFloat(durationParts[2])
		);
	} catch (err) {
		if (silent) {
			return null;
		}

		throw new Error(
			`Kon het tijdsinterval niet analyseren: "${duration}". Verwacht formaat: uu:mm:ss`
		);
	}
}
