import { forIn, isArray, isPlainObject } from 'lodash-es';

export function omitByDeep(obj: any, predicate: (key: string, value: any) => boolean): any {
	const returnObj: any = isArray(obj) ? [] : {};
	forIn(obj, (value, key) => {
		if (!predicate(key, value)) {
			if (isPlainObject(value)) {
				// Recursively omit inner object properties
				returnObj[key] = omitByDeep(value, predicate);
			} else {
				returnObj[key] = value;
			}
		}
		// else if predicate is true => we do not need to copy the property to the returnObj
	});
	return returnObj;
}
