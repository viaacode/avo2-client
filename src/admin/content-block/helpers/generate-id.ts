export const generateId = (blockIndex: number, formGroupIndex: number, stateIndex: number = 1) =>
	`b-${blockIndex}_f-${formGroupIndex}_c-${stateIndex}`;
