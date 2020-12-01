import { isString } from 'lodash-es';

import { CheckboxOption } from '../components';

export function setSelectedCheckboxes(
	options: CheckboxOption[] | string[],
	selectedIds: string[]
): CheckboxOption[] {
	let checkboxes: CheckboxOption[];
	if (isString(options[0])) {
		checkboxes = (options as string[]).map(stringToCheckboxOption);
	} else {
		checkboxes = options as CheckboxOption[];
	}
	return checkboxes.map((option) => {
		option.checked = !!selectedIds.find((id) => id === String(option.id));
		return option;
	});
}

export function stringToCheckboxOption(label: string): CheckboxOption {
	return {
		label,
		id: label,
		checked: false,
	};
}
