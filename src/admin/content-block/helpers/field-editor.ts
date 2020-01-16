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
