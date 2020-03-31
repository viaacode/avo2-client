import { isNumber, pick, pickBy } from 'lodash-es';

import { ContentBlockErrors } from '../../shared/types';

// Handle content-block config components/block state validation
export const validateContentBlockField = (
	fieldKey: string,
	validator: ((value: any) => string[]) | undefined,
	oldErrors: ContentBlockErrors = {},
	value: any,
	stateIndex?: number
): ContentBlockErrors => {
	if (!validator) {
		return oldErrors;
	}

	const errorArray = validator(value);

	if (errorArray.length) {
		if (isNumber(stateIndex)) {
			const errorsByKey = [...(oldErrors[fieldKey] || [])];

			// if (errorsByKey && Array.isArray(errorsByKey[stateIndex])) {
			// 	(errorsByKey[stateIndex] as string[]).splice(stateIndex, 1, ...errorArray);
			// }

			return {
				...oldErrors,
				[fieldKey]: errorsByKey,
			};
		}

		return {
			...oldErrors,
			[fieldKey]: errorArray,
		};
	}

	// If no errors are given, cleanup
	if (isNumber(stateIndex)) {
		const errorsByKey = [...(oldErrors[fieldKey] || [])];
		errorsByKey.splice(stateIndex, 1);

		const updatedErrors = {
			...oldErrors,
			[fieldKey]: errorsByKey,
		};

		return pickBy(updatedErrors, value => value.length !== 0);
	}

	const newKeys = Object.keys(oldErrors).filter(key => key !== fieldKey);

	return pick(oldErrors, newKeys);
};
