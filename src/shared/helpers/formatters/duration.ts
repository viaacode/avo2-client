export function formatDurationMinutesSeconds(
  numSeconds: number | null | undefined,
): string {
  const seconds: number = Math.abs(numSeconds || 0)
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function formatDurationHoursMinutesSeconds(
  numSeconds: number | null | undefined,
): string {
  const seconds: number = Math.abs(numSeconds || 0)
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds - hours * 3600) / 60)
  const secs = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`
}
