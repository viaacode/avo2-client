import { IconName } from '@viaa/avo2-components';
import { ReactElement } from 'react';

export type NavigationItemInfo = {
	label: string | ReactElement;
	key: string;
	location?: string;
	target?: string;
	component?: ReactElement;
	icon?: IconName;
};

export type ReactSelectOption<T = any> = {
	label: string;
	value: T;
};

export type ReactAction<T, P = any> = {
	type: T;
	payload: P;
};

// TODO: remove this once available from @viaa/avo2-components
export type TableColumn = {
	col?:
		| '1'
		| '2'
		| '3'
		| '4'
		| '5'
		| '6'
		| '7'
		| '8'
		| '9'
		| '10'
		| '11'
		| '12'
		| '13'
		| '14'
		| '15';
	id: string;
	label: string;
	sortable?: boolean;
};

// Helpers

// Get all possible values from object
export type ValueOf<T> = T[keyof T];
