import { Avo } from '@viaa/avo2-types';
import queryString from 'query-string';

export async function getCollection(id: string): Promise<Avo.Collection.Response> {
	const url = `${process.env.REACT_APP_PROXY_URL}/collection`;
	return fetch(`${url}?${queryString.stringify({ id })}`, {
		method: 'GET',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
		},
	}).then(response => response.json()) as Promise<Avo.Collection.Response>;
}
