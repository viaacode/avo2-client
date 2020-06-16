import queryString from 'query-string';

import { Avo } from '@viaa/avo2-types';

import { CustomError, getEnv } from '../helpers';
import { fetchWithLogout } from '../helpers/fetch-with-logout';

export type EmailTemplateType = 'item' | 'collection' | 'bundle';

export class CampaignMonitorService {
	public static async fetchNewsletterPreferences(email: string) {
		try {
			const response = await fetchWithLogout(
				`${getEnv('PROXY_URL')}/campaign-monitor/preferences?${queryString.stringify({
					email,
				})}`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
				}
			);

			return response.json();
		} catch (err) {
			throw new CustomError('Failed to fetch newsletter preferences', err, {
				email,
			});
		}
	}

	public static async updateNewsletterPreferences(
		preferences: Partial<Avo.Newsletter.Preferences>
	) {
		try {
			await fetchWithLogout(`${getEnv('PROXY_URL')}/campaign-monitor/preferences`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({ preferences }),
			});
		} catch (err) {
			throw new CustomError('Failed to update newsletter preferences', err, {
				preferences,
			});
		}
	}

	public static async shareThroughEmail(
		email: string,
		title: string,
		link: string,
		type: EmailTemplateType
	): Promise<void> {
		let url: string | undefined;
		let body: any;
		try {
			url = `${getEnv('PROXY_URL')}/campaign-monitor/send`;
			body = {
				to: email,
				template: type,
				data: {
					mainLink: link,
					mainTitle: title,
				},
			};

			const response = await fetchWithLogout(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
				credentials: 'include',
			});
			if (response.status < 200 || response.status >= 400) {
				throw new CustomError('Failed to share item through email', null, {
					response,
				});
			}
			return;
		} catch (err) {
			throw new CustomError('Failed to get player ticket', err, {
				email,
				title,
				link,
				type,
				url,
				body,
			});
		}
	}
}
