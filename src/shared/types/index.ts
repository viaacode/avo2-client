import { IconName } from '@viaa/avo2-components';

export type NavigationItem = {
	label: string;
	location: string;
	icon?: IconName;
};

export type ReactSelectOption<T = any> = {
	label: string;
	value: T;
};

export interface Tab {
	id: string;
	label: string;
	icon?: IconName;
}

// Helpers

// Get all possible values from object
export type ValueOf<T> = T[keyof T];
