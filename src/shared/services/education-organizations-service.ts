import queryString from 'query-string';

import { Avo } from '@viaa/avo2-types';

import { getEnv } from '../helpers';

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
		console.error('Failed to get cities', err, { url });
		throw new Error('Failed to get cities');
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
		const message = 'Failed to get educational organizations';
		console.error(message, err, { url });
		throw new Error(message);
	}
};
