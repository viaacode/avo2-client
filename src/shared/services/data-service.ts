import { print } from 'graphql/language/printer';
import { isString } from 'lodash-es';

import { getEnv } from '../helpers';
import { goToLoginBecauseOfUnauthorizedError } from '../helpers/fetch-with-logout';

// Use by graphql codegen in codegen.yml to fetch info from the dataservice and wrap those requests in react-query hooks
export const fetchData = <TData, TVariables>(
	query: string | any,
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
				query: isString(query) ? query : print(query),
				variables,
			}),
		});

		if (res.status === 401) {
			goToLoginBecauseOfUnauthorizedError();
			return;
		}

		const json = await res.json();

		if (json.errors) {
			const { message } = json.errors[0] || {};
			throw new Error(message || 'Error');
		}

		return json.data;
	};
};

export interface QueryInfo {
	query: string;
	variables?: Record<string, any>;
}

export class dataService {
	public static async query<T>(queryInfo: QueryInfo): Promise<T> {
		return (await fetchData(queryInfo.query, queryInfo.variables)()) as T;
	}
}

export const NO_RIGHTS_ERROR_MESSAGE = 'You are not allowed to run this query';

export const COLLECTION_QUERY_KEYS = ['getCollectionsByOwner'];
