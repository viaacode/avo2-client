import { get, omit } from 'lodash-es';
import moment from 'moment';

import { Avo } from '@viaa/avo2-types';

import { CustomError, performQuery } from '../../shared/helpers';
import { ApolloCacheManager, dataService, ToastService } from '../../shared/services';
import i18n from '../../shared/translations/i18n';
import { ContentBlockService } from '../content-block/services/content-block.service';
import { omitByDeep } from '../shared/helpers/omitByDeep';
import { ContentBlockConfig } from '../shared/types';

import {
	CONTENT_RESULT_PATH,
	CONTENT_TYPES_LOOKUP_PATH,
	ITEMS_PER_PAGE,
	RichEditorStateKey,
	TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
} from './content.const';
import {
	DELETE_CONTENT_LABEL_LINKS,
	GET_CONTENT_BY_ID,
	GET_CONTENT_LABELS_BY_CONTENT_TYPE,
	GET_CONTENT_PAGES,
	GET_CONTENT_PAGES_BY_TITLE,
	GET_CONTENT_TYPES,
	GET_PROJECT_CONTENT_PAGES,
	GET_PROJECT_CONTENT_PAGES_BY_TITLE,
	INSERT_CONTENT,
	INSERT_CONTENT_LABEL,
	INSERT_CONTENT_LABEL_LINKS,
	UPDATE_CONTENT_BY_ID,
} from './content.gql';
import { ContentOverviewTableCols, ContentPageType, DbContent } from './content.types';

export class ContentService {
	public static async getContentItems(limit: number): Promise<Avo.Content.Content[] | null> {
		const query = {
			query: GET_CONTENT_PAGES,
			variables: {
				limit,
				orderBy: { title: 'asc' },
			},
		};

		return performQuery(query, CONTENT_RESULT_PATH.GET, 'Failed to retrieve content items.');
	}

	public static async getProjectContentItems(
		limit: number
	): Promise<Avo.Content.Content[] | null> {
		const query = {
			query: GET_PROJECT_CONTENT_PAGES,
			variables: {
				limit,
				orderBy: { title: 'asc' },
			},
		};

		return performQuery(
			query,
			CONTENT_RESULT_PATH.GET,
			'Failed to retrieve project content items.'
		);
	}

	public static async getContentItemsByTitle(
		title: string,
		limit?: number
	): Promise<Avo.Content.Content[] | null> {
		const query = {
			query: GET_CONTENT_PAGES_BY_TITLE,
			variables: {
				title,
				limit,
				orderBy: { title: 'asc' },
			},
		};

		return performQuery(
			query,
			CONTENT_RESULT_PATH.GET,
			'Failed to retrieve content items by title.'
		);
	}

	public static async getProjectContentItemsByTitle(
		title: string,
		limit: number
	): Promise<Avo.Content.Content[] | null> {
		const query = {
			query: GET_PROJECT_CONTENT_PAGES_BY_TITLE,
			variables: {
				title,
				limit,
				orderBy: { title: 'asc' },
			},
		};

		return performQuery(
			query,
			CONTENT_RESULT_PATH.GET,
			'Failed to retrieve content items by title.'
		);
	}

	public static async getContentPageById(id: number | string): Promise<DbContent | null> {
		const query = {
			query: GET_CONTENT_BY_ID,
			variables: {
				id,
			},
		};

		return performQuery(
			query,
			`${CONTENT_RESULT_PATH.GET}[0]`,
			`Failed to retrieve content item by id: ${id}.`
		);
	}

	public static async getContentTypes(): Promise<ContentPageType[] | null> {
		try {
			const response = await dataService.query({ query: GET_CONTENT_TYPES });

			return get(response, `data.${CONTENT_TYPES_LOOKUP_PATH}`, []).map(
				(obj: { value: ContentPageType }) => obj.value
			);
		} catch (err) {
			console.error('Failed to retrieve content types.', err);
			ToastService.danger(
				i18n.t(
					'admin/content/content___er-ging-iets-mis-tijdens-het-ophalen-van-de-content-types'
				),
				false
			);

			return null;
		}
	}

	public static async fetchLabelsByContentType(
		contentType: string
	): Promise<Avo.Content.ContentLabel[]> {
		let variables: any;

		try {
			variables = {
				contentType,
			};

			const response = await dataService.query({
				variables,
				query: GET_CONTENT_LABELS_BY_CONTENT_TYPE,
			});

			if (response.errors) {
				throw new CustomError(
					'Failed to get content labels by content type from database because of graphql errors',
					null,
					{ response }
				);
			}

			const labels = get(response, 'data.app_content_labels');

			if (!labels) {
				throw new CustomError('The response does not contain any labels', null, {
					response,
				});
			}

			return labels;
		} catch (err) {
			throw new CustomError(
				'Failed to get content labels by content type from database',
				err,
				{
					variables,
					query: 'GET_CONTENT_LABELS_BY_CONTENT_TYPE',
				}
			);
		}
	}

	public static async insertContentLabel(
		label: string,
		contentType: string
	): Promise<Avo.Content.ContentLabel> {
		let variables: any;
		try {
			variables = {
				label,
				contentType,
			};

			const response = await dataService.mutate({
				variables,
				mutation: INSERT_CONTENT_LABEL,
				update: ApolloCacheManager.clearContentLabels,
			});

			if (response.errors) {
				throw new CustomError(
					'Failed to insert content labels in the database because of graphql errors',
					null,
					{ response }
				);
			}

			const contentLabel = get(response, 'data.insert_app_content_labels.returning[0]');

			if (!contentLabel) {
				throw new CustomError('The response does not contain a label', null, {
					response,
				});
			}

			return contentLabel;
		} catch (err) {
			throw new CustomError('Failed to insert content label in the database', err, {
				variables,
				query: 'INSERT_CONTENT_LABEL',
			});
		}
	}

	public static async insertContentLabelsLinks(
		contentPageId: number,
		labelIds: (number | string)[]
	): Promise<void> {
		let variables: any;
		try {
			variables = {
				objects: labelIds.map(labelId => ({
					content_id: contentPageId,
					label_id: labelId,
				})),
			};

			const response = await dataService.mutate({
				variables,
				mutation: INSERT_CONTENT_LABEL_LINKS,
			});

			if (response.errors) {
				throw new CustomError('Failed due to graphql errors', null, { response });
			}
		} catch (err) {
			throw new CustomError('Failed to insert content label links in the database', err, {
				variables,
				query: 'INSERT_CONTENT_LABEL_LINKS',
			});
		}
	}

	public static async deleteContentLabelsLinks(
		contentPageId: number,
		labelIds: (number | string)[]
	): Promise<void> {
		let variables: any;

		try {
			variables = {
				labelIds,
				contentPageId,
			};

			const response = await dataService.mutate({
				variables,
				mutation: DELETE_CONTENT_LABEL_LINKS,
			});

			if (response.errors) {
				throw new CustomError('Failed due to graphql errors', null, { response });
			}
		} catch (err) {
			throw new CustomError('Failed to insert content label links in the database', err, {
				variables,
				query: 'DELETE_CONTENT_LABEL_LINKS',
			});
		}
	}

	private static getOrderObject(
		sortColumn: ContentOverviewTableCols,
		sortOrder: Avo.Search.OrderDirection
	) {
		const getOrderFunc: Function | undefined =
			TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT[sortColumn];

		if (getOrderFunc) {
			return [getOrderFunc(sortOrder)];
		}

		return [{ [sortColumn]: sortOrder }];
	}

	public static async fetchContentPages(
		page: number,
		sortColumn: ContentOverviewTableCols,
		sortOrder: Avo.Search.OrderDirection,
		where: any
	): Promise<[Avo.Content.Content[], number]> {
		let variables: any;
		try {
			variables = {
				where,
				offset: ITEMS_PER_PAGE * page,
				limit: ITEMS_PER_PAGE,
				orderBy: ContentService.getOrderObject(sortColumn, sortOrder),
			};

			const response = await dataService.query({
				variables,
				query: GET_CONTENT_PAGES,
			});

			const contentPages: Avo.Content.Content[] | null = get(
				response,
				'data.app_content',
				[]
			);

			const contentPageCount: number = get(
				response,
				'data.app_content_aggregate.aggregate.count',
				0
			);

			if (!contentPages) {
				throw new CustomError('Response did not contain any content pages', null, {
					response,
				});
			}

			return [contentPages, contentPageCount];
		} catch (err) {
			throw new CustomError('Failed to get content pages from the database', err, {
				variables,
				query: 'GET_CONTENT_PAGES',
			});
		}
	}

	private static cleanupBeforeInsert(contentPage: Partial<DbContent>): Partial<DbContent> {
		return omit(contentPage, [
			'contentBlockssBycontentId',
			'profile',
			'__typename',
			'content_content_labels',
		]);
	}

	public static async insertContentPage(
		contentPage: Partial<DbContent>,
		contentBlockConfigs: ContentBlockConfig[]
	): Promise<Partial<Avo.Content.Content> | null> {
		try {
			const response = await dataService.mutate({
				mutation: INSERT_CONTENT,
				variables: { contentItem: this.cleanupBeforeInsert(contentPage) },
				update: ApolloCacheManager.clearContentCache,
			});

			console.log(contentBlockConfigs);

			if (response.errors) {
				throw new CustomError('Response contains errors', null, { response });
			}

			const id: number | null = get(
				response,
				`data.${CONTENT_RESULT_PATH.INSERT}.returning[0].id`,
				null
			);

			if (id) {
				// Insert content-blocks
				if (contentBlockConfigs && contentBlockConfigs.length) {
					const contentBlocks = await ContentBlockService.insertContentBlocks(
						id,
						contentBlockConfigs
					);

					if (!contentBlocks) {
						// return null to prevent triggering success toast
						return null;
					}
				}

				return { ...contentPage, id } as Partial<Avo.Content.Content>;
			}

			return null;
		} catch (err) {
			console.error('Failed to insert content blocks', err);
			ToastService.danger(
				i18n.t(
					'admin/content/content___er-ging-iets-mis-tijdens-het-opslaan-van-de-content'
				),
				false
			);

			return null;
		}
	}

	public static async updateContentPage(
		contentPage: Partial<DbContent>,
		initialContentBlocks?: Avo.ContentBlocks.ContentBlocks[],
		contentBlockConfigs?: ContentBlockConfig[]
	): Promise<Partial<Avo.Content.Content> | null> {
		try {
			const response = await dataService.mutate({
				mutation: UPDATE_CONTENT_BY_ID,
				variables: {
					contentItem: this.cleanupBeforeInsert(contentPage),
					id: contentPage.id,
				},
				update: ApolloCacheManager.clearContentCache,
			});

			if (response.errors) {
				throw new CustomError('Response contains errors', null, { response });
			}

			const updatedContent = get(response, 'data', null);

			if (contentBlockConfigs && initialContentBlocks) {
				await ContentBlockService.updateContentBlocks(
					contentPage.id as number,
					initialContentBlocks,
					contentBlockConfigs
				);
			}

			if (!updatedContent) {
				throw new CustomError('Content update returned empty response', null, response);
			}

			return contentPage;
		} catch (err) {
			console.error('Failed to save content', err);
			ToastService.danger(
				i18n.t(
					'admin/content/content___er-ging-iets-mis-tijdens-het-opslaan-van-de-content'
				),
				false
			);

			return null;
		}
	}

	/**
	 * Remove rich text editor states, since they are also saved as html,
	 * and we don't want those states to end up in the database
	 * @param blockConfigs
	 */
	public static convertRichTextEditorStatesToHtml(
		blockConfigs: ContentBlockConfig[]
	): ContentBlockConfig[] {
		return omitByDeep(blockConfigs, key => String(key).endsWith(RichEditorStateKey));
	}

	/**
	 * Find name that isn't a duplicate of an existing name of a content page of this user
	 * eg if these content pages exist:
	 * copy 1: test
	 * copy 2: test
	 * copy 4: test
	 *
	 * Then the algorithm will propose: copy 3: test
	 * @param copyPrefix
	 * @param copyRegex
	 * @param existingTitle
	 *
	 * @returns Potential title for duplicate content page.
	 */
	public static getCopyTitleForContentPage = async (
		copyPrefix: string,
		copyRegex: RegExp,
		existingTitle: string
	): Promise<string> => {
		const titleWithoutCopy = existingTitle.replace(copyRegex, '');
		const contentPages = await ContentService.getContentItemsByTitle(`%${titleWithoutCopy}`);
		const titles = (contentPages || []).map(c => c.title);

		let index = 0;
		let candidateTitle: string;

		do {
			index += 1;
			candidateTitle = copyPrefix.replace('%index%', String(index)) + titleWithoutCopy;
		} while (titles.includes(candidateTitle));

		return candidateTitle;
	};

	/**
	 * Add duplicate of content page
	 *
	 * @param contentPage
	 * @param copyPrefix
	 * @param copyRegex
	 *
	 * @returns Duplicate content page.
	 */
	public static async duplicateContentPage(
		contentPage: Avo.Content.Content,
		copyPrefix: string,
		copyRegex: RegExp
	): Promise<Avo.Content.Content | null> {
		try {
			const contentToInsert = { ...contentPage };

			// update attributes specific to duplicate
			contentToInsert.is_public = false;
			(contentToInsert as any).published_at = null; // TODO: Fix type
			contentToInsert.depublish_at = null;
			contentToInsert.publish_at = null;
			contentToInsert.path = null;
			contentToInsert.created_at = moment().toISOString();

			// remove id from duplicate
			delete contentToInsert.id;
			delete contentToInsert.contentBlockssBycontentId;
			delete (contentToInsert as any).content_content_labels;

			try {
				contentToInsert.title = await this.getCopyTitleForContentPage(
					copyPrefix,
					copyRegex,
					contentToInsert.title
				);
			} catch (err) {
				// handle error
				const customError = new CustomError(
					'Failed to retrieve title for duplicate content page',
					err,
					{
						contentToInsert,
					}
				);

				console.error(customError);

				// fallback to simple copy title
				contentToInsert.title = `${copyPrefix.replace(' %index%', '')}${
					contentToInsert.title
				}`;
			}

			const contentBlocks = await ContentBlockService.fetchContentBlocksByContentId(
				contentPage.id
			);

			console.log('CB', contentBlocks);
			const contentBlocksVariables: any[] = (contentBlocks || []).map(contentBlock => {
				const variables: any = { ...contentBlock };

				delete variables.id;

				return variables;
			});

			console.log(contentBlocksVariables);

			// insert duplicated collection
			const duplicatedContentPage: Partial<
				Avo.Content.Content
			> | null = await ContentService.insertContentPage(
				contentToInsert,
				contentBlocksVariables
			);

			return duplicatedContentPage as Avo.Content.Content;
		} catch (err) {
			throw new CustomError('Failed to duplicate collection', err, {
				contentPage,
				copyPrefix,
				copyRegex,
			});
		}
	}
}
