/**
 * Generates a unique key.
 * @param prefix
 * @param blockIndex - Index of block in config array.
 * @param formGroupIndex - Index of form group in field array.
 * @param stateIndex - Index of component in component state.
 */
export const createKey = (
	prefix: string,
	blockIndex: number,
	formGroupIndex?: number,
	stateIndex?: number
) => {
	let key = `${prefix}-b-${blockIndex}`;

	if (formGroupIndex) {
		key += `_f-${formGroupIndex}`;
	}

	if (stateIndex) {
		key += `_c-${stateIndex}`;
	}

	return key;
};
