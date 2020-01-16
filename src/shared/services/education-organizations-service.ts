import queryString from 'query-string';

import { Avo } from '@viaa/avo2-types';

import { CustomError, getEnv } from '../helpers';

export const fetchCities = async (): Promise<string[]> => {
	let url: string | undefined = undefined;
	try {
		url = `${getEnv('PROXY_URL')}/education-organizations/cities`;

		const response = await fetch(url, {
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
};

export const fetchEducationOrganizations = async (
	city: string | null,
	zipCode: string | null
): Promise<Avo.EducationOrganization.Organization[]> => {
	let url: string | undefined = undefined;
	try {
		url = `${getEnv('PROXY_URL')}/education-organizations/organizations?${queryString.stringify({
			city,
			zipCode,
		})}`;

		const response = await fetch(url, {
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
};
