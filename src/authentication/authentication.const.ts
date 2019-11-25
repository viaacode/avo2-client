import { ROUTE_PARTS } from '../shared/constants/routes';
import { UserState } from './authentication.types';

export const INITIAL_USER_STATE: UserState = {
	firstName: '',
	lastName: '',
	email: '',
	password: '',
	type: 'Leerkracht',
	stamboekNumber: '',
};

export const AUTH_PATH = Object.freeze({
	LOGIN_AVO: `/${ROUTE_PARTS.loginAvo}`,
	LOGOUT: `/${ROUTE_PARTS.logout}`,
	REGISTER_OR_LOGIN: `/${ROUTE_PARTS.registerOrLogin}`,
	PUPIL_OR_TEACHER: `/${ROUTE_PARTS.pupilOrTeacher}`,
	STAMBOEK: `/${ROUTE_PARTS.stamboek}`,
	MANUAL_ACCESS_REQUEST: `/${ROUTE_PARTS.manualAccessRequest}`,
});
