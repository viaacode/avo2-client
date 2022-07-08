import { IconName } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { ReactElement } from 'react';

export * from './quick-lane';

export enum KeyCode {
	Enter = 13,
}

export type NewsletterList = keyof Avo.Newsletter.Preferences;

export type NavigationItemInfo = {
	label: string | ReactElement;
	key: string;
	location?: string;
	exact?: boolean;
	target?: string;
	component?: ReactElement;
	icon?: IconName;
	subLinks?: NavigationItemInfo[];
	tooltip?: string;
};

export type ReactSelectOption<T = any> = {
	label: string;
	value: T;
};

export type ReactAction<T, P = any> = {
	type: T;
	payload: P;
};

// Get all possible values from object
export type ValueOf<T> = T[keyof T];

export interface LabeledFormField {
	label?: string;
	help?: string;
}

export type Positioned<T> = T & { id: string | number; position: number };
