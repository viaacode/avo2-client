import { cloneDeep, isArray, isPlainObject, keys } from 'lodash-es';

/**
 * Recursively runs over every property, and replaces it with the return value of the mapping function
 * @param obj
 * @param mappingFunction
 * @param ignoreKey function that identifies keys that should not be recursively followed
 */
export function mapDeep(
	obj: any,
	mappingFunction: (obj: any, key: string, value: any) => void,
	ignoreKey: (key: string) => boolean
): any {
	const clonedObj = cloneDeep(obj);
	const propertiesToRunOver: [any, string | number][] = [];

	propertiesToRunOver.push(
		...keys(clonedObj).map((key: string | number): [any, string | number] => [clonedObj, key])
	);

	let propToRunOver = propertiesToRunOver.shift();
	while (propToRunOver) {
		const [currentObject, key] = propToRunOver;
		const value = currentObject[key];
		if (!ignoreKey(String(key)) && (isPlainObject(value) || isArray(value))) {
			propertiesToRunOver.push(
				...keys(value).map((key: string | number): [any, string | number] => [value, key])
			);
		}

		mappingFunction(currentObject, String(key), value);

		propToRunOver = propertiesToRunOver.shift();
	}
	return clonedObj;
}
