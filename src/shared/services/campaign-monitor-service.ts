import { fetchWithLogoutJson } from '@meemoo/admin-core-ui';
import { type Avo } from '@viaa/avo2-types';
import queryString from 'query-string';

import { CustomError, getEnv } from '../helpers';

export type EmailTemplateType = 'item' | 'collection' | 'bundle';

export class CampaignMonitorService {
	public static async fetchNewsletterPreferences(
		email: string
	): Promise<Avo.Newsletter.Preferences> {
		try {
			return fetchWithLogoutJson<Avo.Newsletter.Preferences>(
				`${getEnv('PROXY_URL')}/campaign-monitor/preferences?${queryString.stringify({
					email,
				})}`
			);
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
			await fetchWithLogoutJson(`${getEnv('PROXY_URL')}/campaign-monitor/preferences`, {
				method: 'POST',
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

			await fetchWithLogoutJson(url, {
				method: 'POST',
				body: JSON.stringify(body),
			});
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
