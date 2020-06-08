import { get, isNil } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../../shared/helpers';
import { ApolloCacheManager, dataService, ToastService } from '../../shared/services';
import i18n from '../../shared/translations/i18n';

import { ITEMS_PER_PAGE } from './content-page-label.const';
import {
	DELETE_CONTENT_PAGE_LABEL,
	GET_CONTENT_PAGE_LABEL_BY_ID,
	GET_CONTENT_PAGE_LABELS,
	INSERT_CONTENT_PAGE_LABEL,
	UPDATE_CONTENT_PAGE_LABEL,
} from './content-page-label.gql';
import { ContentPageLabel, ContentPageLabelOverviewTableCols } from './content-page-label.types';

export class ContentPageLabelService {
	public static async fetchContentPageLabels(
		page: number,
		sortColumn: ContentPageLabelOverviewTableCols,
		sortOrder: Avo.Search.OrderDirection,
		where: any
	): Promise<[ContentPageLabel[], number]> {
		let variables: any;
		try {
			variables = {
				where,
				offset: ITEMS_PER_PAGE * page,
				limit: ITEMS_PER_PAGE,
				orderBy: [{ [sortColumn]: sortOrder }],
			};
			const response = await dataService.query({
				variables,
				query: GET_CONTENT_PAGE_LABELS,
			});
			const contentPageLabel = get(response, 'data.app_content_labels');
			const contentPageLabelCount = get(
				response,
				'data.app_content_labels_aggregate.aggregate.count'
			);

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

	public static async fetchContentPageLabel(id: string): Promise<ContentPageLabel> {
		try {
			const response = await dataService.query({
				query: GET_CONTENT_PAGE_LABEL_BY_ID,
				variables: { id },
			});

			const contentPageLabelObj = get(response, 'data.app_content_labels[0]');

			if (!contentPageLabelObj) {
				throw new CustomError('Failed to find content page label by id', null, {
					response,
				});
			}

			return {
				id: contentPageLabelObj.id,
				label: contentPageLabelObj.label,
				content_type: contentPageLabelObj.content_type,
				created_at: contentPageLabelObj.created_at,
				updated_at: contentPageLabelObj.updated_at,
			};
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
			const response = await dataService.mutate({
				mutation: INSERT_CONTENT_PAGE_LABEL,
				variables: {
					contentPageLabel: {
						label: contentPageLabel.label,
						content_type: contentPageLabel.content_type,
					} as Partial<ContentPageLabel>,
				},
				update: ApolloCacheManager.clearPermissionCache,
			});
			if (response.errors) {
				throw new CustomError('Failed to insert content page label in the database', null, {
					response,
					errors: response.errors,
				});
			}
			const contentPageLabelId = get(
				response,
				'data.insert_app_content_labels.returning[0].id'
			);
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

	static async updateContentPageLabel(contentPageLabel: ContentPageLabel) {
		try {
			const response = await dataService.mutate({
				mutation: UPDATE_CONTENT_PAGE_LABEL,
				variables: {
					contentPageLabel: {
						label: contentPageLabel.label,
						content_type: contentPageLabel.content_type,
					} as Partial<ContentPageLabel>,
					contentPageLabelId: contentPageLabel.id,
				},
				update: ApolloCacheManager.clearPermissionCache,
			});
			if (response.errors) {
				throw new CustomError('Failed to update content page label in the database', null, {
					response,
					errors: response.errors,
				});
			}
		} catch (err) {
			throw new CustomError('Failed to update content page label in the database', err, {
				contentPageLabel,
				query: 'UPDATE_CONTENT_PAGE_LABEL',
			});
		}
	}

	public static async deleteContentPageLabel(contentPageLabelId: number | null | undefined) {
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
			const response = await dataService.mutate({
				mutation: DELETE_CONTENT_PAGE_LABEL,
				variables: {
					id: contentPageLabelId,
				},
				update: ApolloCacheManager.clearPermissionCache,
			});
			if (response.errors) {
				throw new CustomError(
					'Failed to delete content page label from the database',
					null,
					{
						response,
						errors: response.errors,
					}
				);
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to delete content page label from the database', err, {
					contentPageLabelId,
					query: 'DELETE_CONTENT_PAGE_LABEL',
				})
			);
			ToastService.danger(
				i18n.t('Het verwijderen van de content pagina label is mislukt'),
				false
			);
		}
	}
}
