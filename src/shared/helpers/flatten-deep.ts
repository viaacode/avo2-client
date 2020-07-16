function keyIdentity(key: any): any {
	return key;
}

export function flatten(target: any, options: any) {
	const opts = options || {};

	const delimiter = opts.delimiter || '.';
	const maxDepth = opts.maxDepth;
	const transformKey = opts.transformKey || keyIdentity;
	const output: any = {};

	function step(object: any, prev?: any, currentDepth: number = 1) {
		Object.keys(object).forEach(function(key) {
			const value = object[key];
			const isarray = opts.safe && Array.isArray(value);
			const type = Object.prototype.toString.call(value);
			const isobject = type === '[object Object]' || type === '[object Array]';

			const newKey = prev ? prev + delimiter + transformKey(key) : transformKey(key);

			if (
				!isarray &&
				isobject &&
				Object.keys(value).length &&
				(!opts.maxDepth || currentDepth < maxDepth)
			) {
				return step(value, newKey, currentDepth + 1);
			}

			output[newKey] = value;
		});
	}

	step(target);

	return output;
}
