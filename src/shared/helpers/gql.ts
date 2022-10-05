import { get } from 'lodash-es';

import { dataService } from '../services';

import { CustomError } from './custom-error';

interface Query {
	query: any;
	variables?: any;
}

export async function performQuery<T>(
	query: Query,
	subResponse: string | null,
	error: string
): Promise<T> {
	try {
		const response = await dataService.query(query);

		if (subResponse) {
			return get(response, subResponse, null) as T;
		}

		return response as T;
	} catch (err) {
		throw new CustomError(error, err);
	}
}
