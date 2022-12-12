import { LabelObj } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { isNil } from 'lodash-es';

import {
	DeleteContentPageLabelByIdDocument,
	DeleteContentPageLabelByIdMutation,
	GetAllContentPageLabelsDocument,
	GetAllContentPageLabelsQuery,
	GetAllContentPageLabelsQueryVariables,
	GetContentPageLabelByIdDocument,
	GetContentPageLabelByIdQuery,
	GetContentPageLabelByIdQueryVariables,
	InsertContentPageLabelDocument,
	InsertContentPageLabelMutation,
	UpdateContentPageLabelDocument,
	UpdateContentPageLabelMutation,
} from '../../shared/generated/graphql-db-types';
import { CustomError, getEnv } from '../../shared/helpers';
import { fetchWithLogout } from '../../shared/helpers/fetch-with-logout';
import { tHtml } from '../../shared/helpers/translate';
import { dataService } from '../../shared/services/data-service';
import { ToastService } from '../../shared/services/toast-service';
import { ContentPageType } from '../content/content.types';

import { ITEMS_PER_PAGE } from './content-page-label.const';
import { ContentPageLabel, ContentPageLabelOverviewTableCols } from './content-page-label.types';

export class ContentPageLabelService {
	public static async fetchContentPageLabels(
		page: number,
		sortColumn: ContentPageLabelOverviewTableCols,
		sortOrder: Avo.Search.OrderDirection,
		where: GetAllContentPageLabelsQueryVariables['where'],
		itemsPerPage: number = ITEMS_PER_PAGE
	): Promise<[ContentPageLabel[], number]> {
		let variables: GetAllContentPageLabelsQueryVariables | null = null;
		try {
			variables = {
				where,
				offset: itemsPerPage * page,
				limit: itemsPerPage,
				orderBy: [{ [sortColumn]: sortOrder }],
			};
			const response = await dataService.query<GetAllContentPageLabelsQuery>({
				variables,
				query: GetAllContentPageLabelsDocument,
			});
			const contentPageLabel = response.app_content_labels;
			const contentPageLabelCount =
				response.app_content_labels_aggregate.aggregate?.count ?? 0;

			if (!contentPageLabel) {
				throw new CustomError('Response does not contain any content page labels', null, {
					response,
				});
			}

			return [contentPageLabel, contentPageLabelCount];
		} catch (err) {
			throw new CustomError('Failed to get content page labels from the database', err, {
				variables,
				query: 'GET_CONTENT_PAGE_LABELS',
			});
		}
	}

	public static async fetchContentPageLabel(id: number): Promise<ContentPageLabel> {
		try {
			const variables: GetContentPageLabelByIdQueryVariables = { id };
			const response = await dataService.query<GetContentPageLabelByIdQuery>({
				query: GetContentPageLabelByIdDocument,
				variables,
			});

			const contentPageLabelObj = response.app_content_labels[0];

			if (!contentPageLabelObj) {
				throw new CustomError('Failed to find content page label by id', null, {
					response,
				});
			}

			return contentPageLabelObj;
		} catch (err) {
			throw new CustomError('Failed to get content page label by id', err, {
				query: 'GET_CONTENT_PAGE_LABEL_BY_ID',
				variables: { id },
			});
		}
	}

	public static async insertContentPageLabel(
		contentPageLabel: ContentPageLabel
	): Promise<number> {
		try {
			const response = await dataService.query<InsertContentPageLabelMutation>({
				query: InsertContentPageLabelDocument,
				variables: {
					contentPageLabel: {
						label: contentPageLabel.label,
						content_type: contentPageLabel.content_type,
					} as Partial<ContentPageLabel>,
				},
			});
			const contentPageLabelId = response.insert_app_content_labels?.returning?.[0]?.id;
			if (isNil(contentPageLabelId)) {
				throw new CustomError(
					'Response from database does not contain the id of the inserted content page label',
					null,
					{ response }
				);
			}
			return contentPageLabelId;
		} catch (err) {
			throw new CustomError('Failed to insert content page label in the database', err, {
				contentPageLabel,
				query: 'INSERT_CONTENT_PAGE_LABEL',
			});
		}
	}

	static async updateContentPageLabel(contentPageLabelInfo: ContentPageLabel): Promise<void> {
		try {
			await dataService.query<UpdateContentPageLabelMutation>({
				query: UpdateContentPageLabelDocument,
				variables: {
					contentPageLabel: {
						label: contentPageLabelInfo.label,
						content_type: contentPageLabelInfo.content_type,
						link_to: contentPageLabelInfo.link_to,
					} as Partial<ContentPageLabel>,
					contentPageLabelId: contentPageLabelInfo.id,
				},
			});
		} catch (err) {
			throw new CustomError('Failed to update content page label in the database', err, {
				contentPageLabel: contentPageLabelInfo,
				query: 'UPDATE_CONTENT_PAGE_LABEL',
			});
		}
	}

	public static async deleteContentPageLabel(
		contentPageLabelId: number | null | undefined
	): Promise<void> {
		try {
			if (isNil(contentPageLabelId)) {
				throw new CustomError(
					'Failed to delete content page label since the id is nil',
					null,
					{
						contentPageLabelId,
					}
				);
			}
			await dataService.query<DeleteContentPageLabelByIdMutation>({
				query: DeleteContentPageLabelByIdDocument,
				variables: {
					id: contentPageLabelId,
				},
			});
		} catch (err) {
			console.error(
				new CustomError('Failed to delete content page label from the database', err, {
					contentPageLabelId,
					query: 'DELETE_CONTENT_PAGE_LABEL',
				})
			);
			ToastService.danger(
				tHtml(
					'admin/content-page-labels/content-page-label___het-verwijderen-van-de-content-pagina-label-is-mislukt'
				)
			);
		}
	}

	static async getContentPageLabelsByTypeAndLabels(
		contentType: ContentPageType,
		labels: string[]
	): Promise<LabelObj[]> {
		try {
			const reply = await fetchWithLogout(`${getEnv('PROXY_URL')}/content-pages/labels`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					contentType,
					labels,
				}),
			});

			const labelObj = await reply.json();
			return labelObj;
		} catch (err) {
			throw new CustomError(
				'Failed to get content page label objects by content type and labels',
				err,
				{
					contentType,
					labels,
				}
			);
		}
	}

	static async getContentPageLabelsByTypeAndIds(
		contentType: ContentPageType,
		labelIds: number[]
	): Promise<LabelObj[]> {
		try {
			const reply = await fetchWithLogout(`${getEnv('PROXY_URL')}/content-pages/labels`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					contentType,
					labelIds,
				}),
			});

			const labelObj = await reply.json();
			return labelObj;
		} catch (err) {
			throw new CustomError(
				'Failed to get content page labels by content type and label ids',
				err,
				{
					contentType,
					labelIds,
				}
			);
		}
	}
}
