import { Avo } from '@viaa/avo2-types';

import { CheckboxOption } from '../components';

export function stringToCheckboxOption(label: string): CheckboxOption {
	return {
		label,
		id: label,
		checked: false,
	};
}

export function lomToCheckboxOption(lomEntry: Avo.Lom.LomField): CheckboxOption {
	return {
		label: lomEntry.label,
		id: lomEntry.id,
		checked: false,
	};
}
