import { ROUTE_PARTS } from '../shared/constants';
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
	MANUAL_ACCESS_REQUEST: `/${ROUTE_PARTS.manualAccessRequest}`,
	STUDENT_TEACHER: `/${ROUTE_PARTS.studentTeacher}`,
	STAMBOEK: `/${ROUTE_PARTS.stamboek}`,
});

export const SERVER_LOGOUT_PAGE = 'auth/logout';
