import { IconName } from '@viaa/avo2-components';

export const createDropdownMenuItem = (id: string, label: string, icon: string = id) => ({
	id,
	label,
	icon: icon as IconName,
});
