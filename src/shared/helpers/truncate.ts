import { truncate } from 'lodash-es';

export function truncateTableValue(value: string | null | undefined) {
	return truncate(value || '-', { length: 60 });
}
