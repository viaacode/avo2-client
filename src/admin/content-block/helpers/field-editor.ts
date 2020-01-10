/**
 * Generates a unique field id.
 * @param blockIndex - Index of block in config array.
 * @param formGroupIndex - Index of form group in field array.
 * @param stateIndex - Index of component in component state.
 */
export const createFieldEditorId = (
	blockIndex: number,
	formGroupIndex: number,
	stateIndex: number = 1
) => {
	return `b-${blockIndex}_f-${formGroupIndex}_c-${stateIndex}`;
};

/**
 * Generates a unique field id.
 * @param componentName - Singular name of component.
 * @param fieldName - Name of field in component.
 * @param stateIndex - Index of component in component state.
 */
export const createFieldEditorLabel = (
	componentName: string,
	fieldName: string,
	stateIndex?: number
) => {
	return stateIndex || stateIndex === 0
		? `${componentName} ${stateIndex + 1}: ${fieldName}`
		: fieldName;
};
