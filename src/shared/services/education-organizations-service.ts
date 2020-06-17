import queryString from 'query-string';

import { Avo } from '@viaa/avo2-types';

import { CustomError, getEnv } from '../helpers';
import { fetchWithLogout } from '../helpers/fetch-with-logout';

export class EducationOrganisationService {
	public static async fetchCities(): Promise<string[]> {
		let url: string | undefined;
		try {
			url = `${getEnv('PROXY_URL')}/education-organizations/cities`;

			const response = await fetchWithLogout(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			});

			return await response.json();
		} catch (err) {
			throw new CustomError('Failed to get cities', err, { url });
		}
	}

	public static async fetchEducationOrganizations(
		city: string | null,
		zipCode: string | null
	): Promise<Avo.EducationOrganization.Organization[]> {
		let url: string | undefined;
		try {
			url = `${getEnv(
				'PROXY_URL'
			)}/education-organizations/organizations?${queryString.stringify({
				city,
				zipCode,
			})}`;

			const response = await fetchWithLogout(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			});

			return await response.json();
		} catch (err) {
			throw new CustomError('Failed to get educational organizations', err, { url });
		}
	}
}
