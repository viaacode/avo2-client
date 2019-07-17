import { Avo } from '@viaa/avo2-types';
import queryString from 'query-string';

export async function checkLogin(): Promise<{ message: string }> {
	const url = `${process.env.REACT_APP_PROXY_URL}/auth/login`;
	return fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	}).then(response => response.json()) as Promise<{ message: string }>;
}
