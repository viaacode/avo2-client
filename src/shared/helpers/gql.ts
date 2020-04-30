import { get } from 'lodash-es';

import { dataService } from '../services';

import { CustomError } from './custom-error';

interface Query {
	query: any;
	variables?: any;
}

export const performQuery = async (query: Query, subResponse: string | null, error: string) => {
	try {
		const response = await dataService.query(query);

		if (response.errors) {
			throw new CustomError('GraphQL response contains errors');
		}

		if (subResponse) {
			return get(response, subResponse, null);
		}

		return subResponse;
	} catch (err) {
		throw new CustomError(error, err);
	}
};
