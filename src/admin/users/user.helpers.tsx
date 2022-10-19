import { compact } from 'lodash-es';

import { normalizeTimestamp } from '../../shared/helpers';
import i18n from '../../shared/translations/i18n';

import { UserTempAccess } from './user.types';

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
	Partial<UserTempAccess>
>[] = () => [
	{
		// until cannot be null and must be in the future
		error: i18n.t('admin/users/user___de-einddatum-is-verplicht-en-moet-in-de-toekomst-liggen'),
		isValid: (tempAccess: Partial<UserTempAccess>) =>
			!!tempAccess.until && normalizeTimestamp(tempAccess.until).isAfter(),
	},
	{
		// When both from and until date are set, the from date must be < the until date
		error: i18n.t('admin/users/user___de-startdatum-moet-voor-de-einddatum-liggen'),
		isValid: (tempAccess: Partial<UserTempAccess>) => {
			return tempAccess.from
				? !!tempAccess.until &&
						normalizeTimestamp(tempAccess.from).isBefore(
							normalizeTimestamp(tempAccess.until)
						)
				: true;
		},
	},
];

export const getTempAccessValidationErrors = (tempAccess: UserTempAccess): string[] => {
	const validationErrors = [...GET_TEMP_ACCESS_VALIDATION_RULES_FOR_SAVE()].map((rule) => {
		return rule.isValid(tempAccess) ? null : getError(rule, tempAccess);
	});
	return compact(validationErrors);
};
