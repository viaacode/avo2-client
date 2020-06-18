import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../helpers';

import { dataService } from './data-service';
import { GET_ALL_ORGANISATIONS } from './organizations-service.gql';

export class OrganisationService {
	public static async fetchAllOrganisations(): Promise<Partial<Avo.Organization.Organization>[]> {
		try {
			const response = await dataService.query({
				query: GET_ALL_ORGANISATIONS,
			});

			if (response.errors) {
				throw new CustomError('GraphQL response contains errors', null, { response });
			}

			const organisations: Partial<Avo.Organization.Organization>[] | null = get(
				response,
				'data.shared_organisations'
			);

			if (!organisations) {
				throw new CustomError('Response does not contain any organisations', null, {
					response,
				});
			}

			return organisations;
		} catch (err) {
			throw new CustomError('Failed to get organisations from the database', err, {
				query: 'GET_ALL_ORGANISATIONS',
			});
		}
	}
}
