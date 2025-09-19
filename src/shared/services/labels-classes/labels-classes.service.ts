import { type Avo } from '@viaa/avo2-types';
import { stringifyUrl } from 'query-string';

import { CustomError } from '../../helpers/custom-error';
import { getEnv } from '../../helpers/env';

export class LabelsClassesService {
	public static async getLabelsForProfile(type?: string): Promise<Avo.LabelClass.LabelClass[]> {
		let url: string | undefined = undefined;

		try {
			url = stringifyUrl({
				url: `${getEnv('PROXY_URL')}/labels-classes`,
				query: {
					type: type,
				},
			});

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			return fetchWithLogoutJson<Avo.LabelClass.LabelClass[]>(url);
		} catch (err) {
			const error = new CustomError('Failed to get labels and classes for user', err, {
				url,
				type,
			});
			console.error(error);
			throw error;
		}
	}

	public static async getLabels(): Promise<Avo.LabelClass.LabelClass[]> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/labels-classes/all`;

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			return fetchWithLogoutJson<Avo.LabelClass.LabelClass[]>(url);
		} catch (err) {
			const error = new CustomError('Failed to get labels and classes', err, {
				url,
			});
			console.error(error);
			throw error;
		}
	}

	public static async insertLabels(labels: Avo.LabelClass.LabelClass[]): Promise<number[]> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/labels-classes`;

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			return fetchWithLogoutJson<number[]>(url, {
				method: 'POST',
				body: JSON.stringify(labels),
			});
		} catch (err) {
			const error = new CustomError('Failed to insert labels and classes', err, {
				url,
			});
			console.error(error);
			throw error;
		}
	}

	public static async updateLabel(
		labelId: string,
		value: Avo.LabelClass.LabelClassColor
	): Promise<void> {
		let url: string | undefined = undefined;

		debugger;
		try {
			url = `${getEnv('PROXY_URL')}/labels-classes/${labelId}`;

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			return fetchWithLogoutJson<void>(url, {
				method: 'PATCH',
				body: JSON.stringify(value),
			});
		} catch (err) {
			const error = new CustomError('Failed to update labels and classes', err, {
				url,
				labelId,
				value,
			});
			console.error(error);
			throw error;
		}
	}

	public static async deleteLabels(labelIds: string[]): Promise<void> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/labels-classes`;

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			await fetchWithLogoutJson(url, {
				method: 'DELETE',
				body: JSON.stringify(labelIds),
			});
		} catch (err) {
			const error = new CustomError('Failed to delete labels and classes', err, {
				url,
				labelIds,
			});
			console.error(error);
			throw error;
		}
	}

	public static async getLabelColors(): Promise<Avo.LabelClass.LabelClassColor[]> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/labels-classes/colors`;

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			return fetchWithLogoutJson<Avo.LabelClass.LabelClassColor[]>(url);
		} catch (err) {
			const error = new CustomError('Failed to get labels and classes colors', err, {
				url,
			});
			console.error(error);
			throw error;
		}
	}
}
