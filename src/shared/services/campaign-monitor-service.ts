import { fetchWithLogoutJson } from '@meemoo/admin-core-ui';
import { stringifyUrl } from 'query-string';

import { CustomError, getEnv } from '../helpers';

export type EmailTemplateType = 'item' | 'collection' | 'bundle';

// TODO replace withAvo.Newsletter.Preferences when typings v2.49.5 is released together with proxy v1.26.0 (rondje 3)
export interface NewsletterPreferences {
	newsletter: boolean;
	workshop: boolean;
	ambassador: boolean;
}

export class CampaignMonitorService {
	public static async fetchNewsletterPreferences(
		preferenceCenterKey?: string
	): Promise<NewsletterPreferences> {
		try {
			return fetchWithLogoutJson<NewsletterPreferences>(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/campaign-monitor/preferences`,
					query: {
						preferenceCenterKey,
					},
				})
			);
		} catch (err) {
			throw new CustomError('Failed to fetch newsletter preferences', err);
		}
	}

	public static async updateNewsletterPreferences(
		preferences: Partial<NewsletterPreferences>,
		preferenceCenterKey?: string
	) {
		try {
			await fetchWithLogoutJson(`${getEnv('PROXY_URL')}/campaign-monitor/preferences`, {
				method: 'POST',
				body: JSON.stringify({ preferences, preferenceCenterKey }),
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
