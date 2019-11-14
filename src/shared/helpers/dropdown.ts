import { IconName } from '../types/types';

export const createDropdownMenuItem = (id: string, label: string, icon: string = id) => ({
	id,
	label,
	icon: icon as IconName,
});
