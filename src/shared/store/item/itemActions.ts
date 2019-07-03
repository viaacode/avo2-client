import { Avo } from '@viaa/avo2-types';
import queryString from 'query-string';

export async function getItem(id: string): Promise<Avo.Item.Response> {
	const url = `${process.env.REACT_APP_PROXY_URL}/item`;
	return fetch(`${url}?${queryString.stringify({ id })}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	}).then(response => response.json()) as Promise<Avo.Item.Response>;
}
