import { forIn, isArray, isPlainObject } from 'lodash-es';

/**
 * Recursively runs over every property, and replaces it with the return value of the mapping function
 * @param obj
 * @param mappingFunction
 * @param ignoreKey function that identifies keys that should not be recursively followed
 */
export function mapDeep(
	obj: any,
	mappingFunction: (obj: any, key: string, value: any) => any,
	ignoreKey: (key: string) => boolean
): any {
	let modifiedObj = isArray(obj) ? [...obj] : { ...obj };
	forIn(modifiedObj, (value, key) => {
		modifiedObj = mappingFunction(modifiedObj, key, value);

		if (!ignoreKey(key) && isPlainObject(value)) {
			// Recursively map object properties
			modifiedObj[key] = mapDeep(value, mappingFunction, ignoreKey);
		}
	});
	return modifiedObj;
}
