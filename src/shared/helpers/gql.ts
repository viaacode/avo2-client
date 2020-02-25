import { get } from 'lodash-es';

import { dataService } from '../services/data-service';
import toastService from '../services/toast-service';

interface Query {
	query: any;
	variables?: any;
}

export const performQuery = async (
	query: Query,
	subResponse: string,
	error: string,
	feedback: string
) => {
	try {
		const response = await dataService.query(query);

		return get(response, subResponse, null);
	} catch (err) {
		console.error(error);
		toastService.danger(feedback, false);

		return null;
	}
};
