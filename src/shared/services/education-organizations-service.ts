import queryString from 'query-string';

import { getEnv } from '../helpers';

export interface ClientEducationOrganization {
	// TODO move to typings repo
	organizationId: string;
	unitId: string;
	label: string; // org.name + ' - ' + unit.address
}

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
): Promise<ClientEducationOrganization[]> => {
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
