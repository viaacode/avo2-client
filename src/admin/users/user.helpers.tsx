import { type Avo } from '@viaa/avo2-types';
import { isAfter, isBefore } from 'date-fns';
import { compact } from 'lodash-es';

import { tText } from '../../shared/helpers/translate';

// Validation
type ValidationRule<T> = {
	error: string | ((object: T) => string);
	isValid: (object: T) => boolean;
};

function getError<T>(rule: ValidationRule<T>, object: T) {
	if (typeof rule.error === 'string') {
		return rule.error;
	}
	return rule.error(object);
}

const GET_TEMP_ACCESS_VALIDATION_RULES_FOR_SAVE: () => ValidationRule<
	Partial<Avo.User.TempAccess>
>[] = () => [
	{
		// until cannot be null and must be in the future
		error: tText('admin/users/user___de-einddatum-is-verplicht-en-moet-in-de-toekomst-liggen'),
		isValid: (tempAccess: Partial<Avo.User.TempAccess>) =>
			!!tempAccess.until && isAfter(new Date(tempAccess.until), new Date()),
	},
	{
		// When both from and until date are set, the from-date must be < the until date
		error: tText('admin/users/user___de-startdatum-moet-voor-de-einddatum-liggen'),
		isValid: (tempAccess: Partial<Avo.User.TempAccess>) => {
			return tempAccess.from
				? !!tempAccess.until &&
						isBefore(new Date(tempAccess.from), new Date(tempAccess.until))
				: true;
		},
	},
];

export const getTempAccessValidationErrors = (tempAccess: Avo.User.TempAccess): string[] => {
	const validationErrors = [...GET_TEMP_ACCESS_VALIDATION_RULES_FOR_SAVE()].map((rule) => {
		return rule.isValid(tempAccess) ? null : getError(rule, tempAccess);
	});
	return compact(validationErrors);
};
