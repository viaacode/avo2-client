import { CustomError, getEnv } from '../helpers';

export const fetchEducationLevels = async (): Promise<string[]> => {
	let url: string | undefined;

	try {
		url = `${getEnv('PROXY_URL')}/education-levels`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		return await response.json();
	} catch (err) {
		throw new CustomError('Failed to get education levels', err, { url });
	}
};
