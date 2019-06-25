import queryString from 'query-string';
import { DetailResponse } from '../../types/detailTypes';

export async function getDetail(id: string): Promise<DetailResponse> {
	const url = `${process.env.REACT_APP_PROXY_URL}/detail`;
	return fetch(`${url}?${queryString.stringify({ id })}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	}).then(response => response.json()) as Promise<DetailResponse>;
}
