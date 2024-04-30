import { type IconName } from '@viaa/avo2-components';

export const createDropdownMenuItem = (
	id: string,
	label: string,
	icon: string = id,
	enabled: boolean
) => {
	if (!enabled) {
		return [];
	}
	return [
		{
			id,
			label,
			icon: icon as IconName,
		},
	];
};
