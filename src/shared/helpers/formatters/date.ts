import { format, formatDistance } from 'date-fns';
import { isString } from 'es-toolkit';

type DateLike = string | Date | number;

/**
 * Converts a date from format 2000-12-31 to 31/12/2000
 */
export function reorderDate(
  dateString: string | null,
  separator = '/',
): string {
  return (dateString || '')
    .substring(0, 10)
    .split('-')
    .reverse()
    .join(separator);
}

export function normalizeTimestamp(timestamp: DateLike): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  } else if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }

  return new Date(timestamp);
}

/**
 * Convert viaa format to relative date
 * @param timestamp
 */
export function fromNow(timestamp: Date | undefined | null): string {
  if (!timestamp) {
    return '';
  }
  return formatDistance(timestamp, new Date());
}

export function formatTimestamp(
  timestamp: Date | string | undefined | null,
  includeSeconds = true,
): string {
  if (!timestamp) {
    return '';
  }
  return format(
    normalizeTimestamp(timestamp),
    `d MMMM yyyy HH:mm${includeSeconds ? ':ss' : ''}`,
  );
}

export function formatCustomTimestamp(
  timestamp: Date | string | undefined | null,
  dateFormat: string,
): string {
  if (!timestamp) {
    return '';
  }
  if (isString(timestamp)) {
    return format(new Date(timestamp), dateFormat);
  }
  return format(timestamp, dateFormat);
}

export function formatDate(
  timestamp: Date | string | undefined | null,
): string {
  if (!timestamp) {
    return '';
  }
  if (isString(timestamp)) {
    return format(new Date(timestamp), 'dd-MM-yyyy');
  }
  return format(timestamp, 'dd-MM-yyyy');
}

export function toIsoDate(timestamp: Date | string | undefined | null): string {
  if (!timestamp) {
    return '';
  }
  if (isString(timestamp)) {
    return format(new Date(timestamp), 'yyyy-MM-dd');
  }
  return format(timestamp, 'yyyy-MM-dd');
}

export function toDateObject(
  timestamp: Date | string | undefined | null,
): Date | null {
  if (!timestamp) {
    return null;
  }
  if (isString(timestamp)) {
    return new Date(timestamp);
  }
  return timestamp;
}
