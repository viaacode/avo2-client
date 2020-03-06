import { isArray } from 'lodash-es';
import { DateRange } from '../../../shared/components/DateRangeDropdown/DateRangeDropdown';

export const DateRangeParam = {
	encode: (value: DateRange | undefined) => {
		if (!value) {
			return undefined;
		}
		return JSON.stringify(value);
	},
	decode: (value: string | string[]): DateRange | undefined => {
		try {
			if (Array.isArray(value)) {
				if (value.length) {
					return JSON.parse(value[0]);
				}
				return undefined;
			}
			return JSON.parse(value);
		} catch (err) {
			return undefined;
		}
	},
};

export const CheckboxListParam = {
	encode: (value: string[] | undefined) => {
		if (!value) {
			return undefined;
		}
		return value.join(',');
	},
	decode: (value: string | string[]): string[] | undefined => {
		try {
			if (!value) {
				return [];
			}
			if (isArray(value)) {
				return value;
			}
			return value.split(',');
		} catch (err) {
			return undefined;
		}
	},
};
