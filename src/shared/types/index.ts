import { ReactElement } from 'react';

import { IconName } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

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
