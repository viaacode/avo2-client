import { type SelectOption, type TagInfo } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';

export function stringToTagInfo(label: string): TagInfo {
	return {
		label,
		value: label,
	};
}

export function lomToTagInfo(lomEntry: Avo.Lom.LomField): TagInfo {
	return {
		label: lomEntry.label,
		value: lomEntry.id,
	};
}

export function stringToSelectOption(label: string): SelectOption<string> {
	return {
		label,
		value: label,
	};
}
