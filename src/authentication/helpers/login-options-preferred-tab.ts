import { NOT_NOW_LOCAL_STORAGE_KEY } from '../../shared/constants';

const LoginOptionsPreferredTabStorageKey = 'LoginOptions.preference';

export const LoginOptionsTabs = {
	TEACHER: 'lesgever',
	STUDENT: 'leerling',
};

export function getPreferredLoginOption() {
	return localStorage?.getItem(LoginOptionsPreferredTabStorageKey) || LoginOptionsTabs.TEACHER;
}

export function setPreferredLoginOption(id: string | number) {
	localStorage.setItem(LoginOptionsPreferredTabStorageKey, id.toString());
}

export function removePreferredLoginOption() {
	localStorage.removeItem(NOT_NOW_LOCAL_STORAGE_KEY);
}
