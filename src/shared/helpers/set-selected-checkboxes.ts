import { type Avo } from '@viaa/avo2-types';

import { type CheckboxOption } from '../components';

export function lomToCheckboxOption(lomEntry: Avo.Lom.LomField): CheckboxOption {
	return {
		label: lomEntry.label,
		id: lomEntry.id,
		checked: false,
	};
}
