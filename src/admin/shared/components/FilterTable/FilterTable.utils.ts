import { isArray, isEmpty, isNil, isPlainObject, isString, omitBy } from 'lodash-es';

// Removes all props where the value is undefined, null, [], {}, ''
export function cleanupObject(obj: any) {
	return omitBy(
		obj,
		(value: any) =>
			isNil(value) ||
			(isString(value) && !value.length) ||
			((isPlainObject(value) || isArray(value)) && isEmpty(value)) ||
			(isPlainObject(value) && value.gte === '' && value.lte === '')
	);
}

function getColumnKey(key: string) {
	return `AVO.admin_preferred_columns.${key.replaceAll('/', '_')}`;
}

export function setPreferredColumns(columnKey: string, value: string[]): void {
	localStorage.setItem(getColumnKey(columnKey), JSON.stringify(value));
}

export function getPreferredColumns(columnKey: string): string[] {
	const columns = localStorage.getItem(getColumnKey(columnKey));
	return columns ? JSON.parse(columns) : [];
}
