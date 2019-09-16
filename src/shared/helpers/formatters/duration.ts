export function formatDuration(numSeconds: number | null | undefined) {
	const seconds: number = Math.abs(numSeconds || 0);
	const min = Math.floor(seconds / 60);
	const sec = seconds % 60;

	return `${min}:${sec.toString().padStart(2, '0')}`;
}

/**
 * Converts seconds or a duration string to seconds
 * 00:03:36 =>
 *
 * @param duration
 */
export function toSeconds(duration: number | string | undefined | null) {
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
			parseFloat(durationParts[0])
		);
	} catch (err) {
		throw new Error(
			`Kon het tijdsinterval niet analyseren: "${duration}". Verwacht formaat: uu:mm:ss`
		);
	}
}
