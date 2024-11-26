import { goToLoginBecauseOfUnauthorizedError } from '@meemoo/admin-core-ui/dist/client.mjs';

import { JWT_TOKEN } from '../../authentication/authentication.const';
import { getEnv } from '../helpers';

// Use by graphql codegen in codegen.yml to fetch info from the dataservice and wrap those requests in react-query hooks
export const fetchData = <TData, TVariables>(
	query: string,
	variables?: TVariables,
	options?: RequestInit['headers']
): (() => Promise<TData>) => {
	return async () => {
		const jwtToken = new URLSearchParams(window.location.search).get(JWT_TOKEN);
		const res = await fetch(`${getEnv('PROXY_URL')}/data`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				// Add jwtToken to headers
				// From the jwtToken query param
				// This is only used for authentication of the avo embed code
				...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
				...options,
			},
			credentials: 'include',
			body: JSON.stringify({
				query: query,
				variables,
			}),
		});

		if (res.status === 401) {
			goToLoginBecauseOfUnauthorizedError();
			return;
		}

		const json = await res.json();

		if (json?.errors || res.status >= 400) {
			const { message } = json?.errors?.[0] || {};
			throw new Error(message || res.statusText || 'Error');
		}

		return json.data;
	};
};

export interface QueryInfo<TVariables> {
	query: string;
	variables?: TVariables;
}

export class dataService {
	public static async query<TQueryResponse, TVariables>(
		queryInfo: QueryInfo<TVariables>
	): Promise<TQueryResponse> {
		return (await fetchData(queryInfo.query, queryInfo.variables)()) as TQueryResponse;
	}
}

export const NO_RIGHTS_ERROR_MESSAGE = 'You are not allowed to run this query';

export const COLLECTION_QUERY_KEYS = ['getCollectionsByOwner'];
