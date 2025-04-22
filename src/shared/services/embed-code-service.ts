import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/dist/client.mjs';
import { type Avo } from '@viaa/avo2-types';
import { stringifyUrl } from 'query-string';

import { ITEMS_PER_PAGE } from '../../workspace/workspace.const';
import { CustomError, getEnv } from '../helpers';
import { type EmbedCode } from '../types/embed-code';
import type { TableColumnDataType } from '../types/table-column-data-type';

export interface EmbedCodeFilters {
	filterString?: string;
	sortColumn?: string;
	sortOrder?: Avo.Search.OrderDirection;
	sortType?: TableColumnDataType;
	limit: number;
	offset: number;
}

export class EmbedCodeService {
	public static async createEmbedCode(data: EmbedCode): Promise<string> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/embed-codes/`;

			const response = await fetchWithLogoutJson<{
				message: 'success';
				createdEmbedCodeId: string;
			}>(url, {
				method: 'POST',
				body: JSON.stringify(data),
				forceLogout: false,
			});
			return response.createdEmbedCodeId;
		} catch (err) {
			throw new CustomError('Failed to create embed code', err, {
				url,
				data,
			});
		}
	}

	public static async getEmbedCodes(params?: EmbedCodeFilters): Promise<{
		embedCodes: EmbedCode[];
		count: number;
	}> {
		let url: string | undefined = undefined;

		try {
			url = stringifyUrl({
				url: `${getEnv('PROXY_URL')}/embed-codes`,
				query: {
					sortColumn: params?.sortColumn,
					sortOrder: params?.sortOrder,
					tableColumnDataType: params?.sortType,
					offset: params?.offset,
					limit: params?.limit || ITEMS_PER_PAGE,
					filterString: params?.filterString,
				},
			});
			return fetchWithLogoutJson(url);
		} catch (err) {
			throw new CustomError('Failed to fetch embed codes from database', err, {
				...params,
				url,
			});
		}
	}
}
