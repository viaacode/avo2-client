/**
 * Converts a duration in the form: 00:00:00 to number of seconds
 * @param duration
 */
import { CustomError } from '../custom-error.js'

export function parseDuration(duration: string) {
  const parts = duration.split(':')
  return (
    parseInt(parts[0], 10) * 3600 +
    parseInt(parts[1], 10) * 60 +
    parseInt(parts[2], 10)
  )
}

/**
 * Converts seconds or a duration string to seconds
 * 00:03:36 => 216
 *
 * @param duration
 * @param silent if this function should throw an error or instead return null if the format of the duration is invalid
 */
export function toSeconds(
  duration: number | string | undefined | null,
  silent = false,
): number | null {
  if (!duration) {
    return 0
  }
  if (typeof duration === 'number') {
    return duration
  }

  const durationParts = duration.split(':')
  try {
    if (durationParts.length !== 3) {
      throw new CustomError(
        `Kon het tijdsinterval niet analyseren: "${duration}". Verwacht formaat: uu:mm:ss`,
      )
    }
    return (
      parseInt(durationParts[0], 10) * 3600 +
      parseInt(durationParts[1], 10) * 60 +
      parseFloat(durationParts[2])
    )
  } catch (err) {
    if (silent) {
      return null
    }
    throw new CustomError(
      `Kon het tijdsinterval niet analyseren: "${duration}". Verwacht formaat: uu:mm:ss`,
      err,
      { duration },
    )
  }
}
