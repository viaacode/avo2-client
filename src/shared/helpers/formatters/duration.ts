export function formatDuration(numSeconds: number | null | undefined) {
	const seconds: number = Math.abs(numSeconds || 0);
	const min = Math.floor(seconds / 60);
	const sec = seconds % 60;

	return `${min}:${sec.toString().padStart(2, '0')}`;
}
