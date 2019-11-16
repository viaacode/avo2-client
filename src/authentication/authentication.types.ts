export type UserRole = 'Leerkracht' | 'Leerling';

export interface UserState {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	type: UserRole;
	hasRegimentalNo: boolean;
	regimentalNo: string;
}

export type ActionPayload = string | boolean;

export interface Action {
	type: string;
	payload: ActionPayload;
}
