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
