import { forIn, isObject } from 'lodash-es';

export function omitByDeep(obj: any, predicate: (key: string, value: any) => boolean): any {
	forIn(obj, (value, key) => {
		if (predicate(key, value)) {
			// delete before checking the inner object to avoid circular references that will be deleted anyways
			delete obj[key];
		} else if (isObject(value)) {
			// Recursively omit inner object properties
			obj[key] = omitByDeep(value, predicate);
		}
	});
	return obj;
}
