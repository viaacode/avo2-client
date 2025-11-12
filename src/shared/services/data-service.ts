import { goToLoginBecauseOfUnauthorizedError } from '@meemoo/admin-core-ui/client';

import { getEnv } from '../helpers/env.js';

// Use by graphql codegen in codegen.yml to fetch info from the dataservice and wrap those requests in react-query hooks
export const fetchData = <TData, TVariables>(
	query: string,
	variables?: TVariables,
	options?: RequestInit['headers']
): (() => Promise<TData>) => {
	return async () => {
		const res = await fetch(`${getEnv('PROXY_URL')}/data`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
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
