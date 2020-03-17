export type UserRole = 'Leerkracht' | 'Leerling';

export interface UserState {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	type: UserRole;
	stamboekNumber: string;
}

export type ActionPayload = string | boolean;

export interface Action {
	type: string;
	payload: ActionPayload;
}

export enum LoginMessage {
	LOGGED_IN = 'LOGGED_IN',
	LOGGED_OUT = 'LOGGED_OUT',
}

export enum SpecialPermissionGroups {
	loggedOutUsers = -1,
	loggedInUsers = -2,
}
