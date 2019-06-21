export const get = (obj: any, path: string, defaultValue = null) =>
	String.prototype.split
		.call(path, /[,[\].]+?/)
		.filter(Boolean)
		.reduce((a, c) => (Object.hasOwnProperty.call(a, c) ? a[c] : defaultValue), obj);
