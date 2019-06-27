import { Avo } from '@viaa/avo2-types';
import queryString from 'query-string';

export async function getDetail(id: string): Promise<Avo.Detail.Response> {
	const url = `${process.env.REACT_APP_PROXY_URL}/detail`;
	return fetch(`${url}?${queryString.stringify({ id })}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	}).then(response => response.json()) as Promise<Avo.Detail.Response>;
}
