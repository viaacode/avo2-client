import { SelectOption, TagInfo } from '@viaa/avo2-components';

export function stringToTagInfo(label: string): TagInfo {
	return {
		label,
		value: label,
	};
}

export function stringToSelectOption(label: string): SelectOption<string> {
	return {
		label,
		value: label,
	};
}
