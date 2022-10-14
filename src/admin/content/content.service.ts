import { Avo } from '@viaa/avo2-types';
import { get, isFunction, kebabCase, omit } from 'lodash-es';
import moment from 'moment';

import {
	DeleteContentLabelLinksDocument,
	DeleteContentLabelLinksMutation,
	GetContentByIdDocument,
	GetContentByIdQuery,
	GetContentByIdQueryVariables,
	GetContentLabelsByContentTypeDocument,
	GetContentLabelsByContentTypeQuery,
	GetContentLabelsByContentTypeQueryVariables,
	GetContentPagesDocument,
	GetContentPagesQuery,
	GetContentPagesQueryVariables,
	GetContentTypesDocument,
	GetContentTypesQuery,
	GetPublicContentPagesByTitleDocument,
	GetPublicContentPagesByTitleQuery,
	GetPublicContentPagesByTitleQueryVariables,
	GetPublicProjectContentPagesByTitleDocument,
	GetPublicProjectContentPagesByTitleQuery,
	GetPublicProjectContentPagesDocument,
	GetPublicProjectContentPagesQuery,
	InsertContentDocument,
	InsertContentLabelLinksDocument,
	InsertContentLabelLinksMutation,
	InsertContentMutation,
	Order_By,
	SoftDeleteContentDocument,
	SoftDeleteContentMutation,
	SoftDeleteContentMutationVariables,
	UpdateContentByIdDocument,
	UpdateContentByIdMutation,
} from '../../shared/generated/graphql-db-types';
import { CustomError, performQuery, sanitizeHtml } from '../../shared/helpers';
import { getOrderObject } from '../../shared/helpers/generate-order-gql-query';
import { SanitizePreset } from '../../shared/helpers/sanitize/presets';
import { ApolloCacheManager, dataService, ToastService } from '../../shared/services';
import i18n from '../../shared/translations/i18n';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { ContentBlockService } from '../content-block/services/content-block.service';
import { mapDeep } from '../shared/helpers/map-deep';
import { ContentBlockConfig } from '../shared/types';

import {
	CONTENT_RESULT_PATH,
	DELETED_CONTENT_PAGE_PATH_PREFIX,
	ITEMS_PER_PAGE,
	RichEditorStateKey,
	TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
} from './content.const';
import { ContentOverviewTableCols, ContentPageDb, ContentPageInfo } from './content.types';
import {
	convertToContentPageInfo,
	convertToContentPageInfos,
	convertToDatabaseContentPage,
} from './helpers/parsers';

export class ContentService {
	public static async getPublicContentItems(limit: number): Promise<ContentPageInfo[] | null> {
		const query = {
			query: GetContentPagesDocument,
			variables: {
				limit,
				orderBy: { title: 'asc' },
				where: { is_public: { _eq: true }, is_deleted: { _eq: false } },
			},
		};

		return convertToContentPageInfos(
			(await performQuery<GetContentPagesQuery['app_content']>(
				query,
				'app_content',
				'Failed to retrieve content pages.'
			)) || []
		) as ContentPageInfo[];
	}

	public static async getPublicProjectContentItems(
		limit: number
	): Promise<GetPublicProjectContentPagesQuery['app_content']> {
		const query = {
			query: GetPublicProjectContentPagesDocument,
			variables: {
				limit,
				orderBy: { title: 'asc' },
			},
		};

		return (
			(await performQuery<GetPublicProjectContentPagesQuery['app_content']>(
				query,
				'app_content',
				'Failed to retrieve project content pages.'
			)) || []
		);
	}

	public static async getPublicContentItemsByTitle(
		title: string,
		limit?: number
	): Promise<Pick<ContentPageDb, 'path' | 'title'>[]> {
		const variables: GetPublicContentPagesByTitleQueryVariables = {
			limit: limit || null,
			orderBy: { title: Order_By.Asc },
			where: {
				title: { _ilike: `%${title}%` },
				is_public: { _eq: true },
				is_deleted: { _eq: false },
			},
		};

		const response = await dataService.query<GetPublicContentPagesByTitleQuery>({
			query: GetPublicContentPagesByTitleDocument,
			variables,
		});

		return response.app_content;
	}

	public static async getPublicProjectContentItemsByTitle(
		title: string,
		limit: number
	): Promise<GetPublicProjectContentPagesByTitleQuery['app_content'] | null> {
		const query = {
			query: GetPublicProjectContentPagesByTitleDocument,
			variables: {
				title,
				limit,
				orderBy: { title: 'asc' },
			},
		};

		return performQuery(
			query,
			CONTENT_RESULT_PATH.GET,
			'Failed to retrieve content pages by title.'
		);
	}

	public static async getContentPageById(id: number): Promise<ContentPageInfo> {
		const variables: GetContentByIdQueryVariables = {
			id,
		};

		const response = await dataService.query<GetContentByIdQuery>({
			query: GetContentByIdDocument,
			variables,
		});

		const dbContentPage = response?.app_content?.[0];

		if (!dbContentPage) {
			throw new CustomError('No content page found with provided id', null, {
				id,
				code: 'NOT_FOUND',
			});
		}
		return convertToContentPageInfo(dbContentPage);
	}

	public static async getContentTypes(): Promise<
		{ value: Avo.ContentPage.Type; label: string }[] | null
	> {
		try {
			const response = await dataService.query<GetContentTypesQuery>({
				query: GetContentTypesDocument,
			});

			return response.lookup_enum_content_types.map((obj) => ({
				value: obj.value as Avo.ContentPage.Type,
				label: obj.description || 'unknown type',
			}));
		} catch (err) {
			console.error('Failed to retrieve content types.', err, { query: 'GET_CONTENT_TYPES' });
			ToastService.danger(
				i18n.t(
					'admin/content/content___er-ging-iets-mis-tijdens-het-ophalen-van-de-content-types'
				)
			);

			return null;
		}
	}

	public static async fetchLabelsByContentType(
		contentType: string
	): Promise<Avo.ContentPage.Label[]> {
		let variables: GetContentLabelsByContentTypeQueryVariables | null = null;

		try {
			variables = {
				contentType,
			};

			const response = await dataService.query<GetContentLabelsByContentTypeQuery>({
				variables,
				query: GetContentLabelsByContentTypeDocument,
			});

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

	public static async insertContentLabelsLinks(
		contentPageId: number,
		labelIds: (number | string)[]
	): Promise<void> {
		let variables: any;
		try {
			variables = {
				objects: labelIds.map((labelId) => ({
					content_id: contentPageId,
					label_id: labelId,
				})),
			};

			await dataService.query<InsertContentLabelLinksMutation>({
				query: InsertContentLabelLinksDocument,
				variables,
				update: ApolloCacheManager.clearContentLabels,
			});
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

			await dataService.query<DeleteContentLabelLinksMutation>({
				query: DeleteContentLabelLinksDocument,
				variables,
				update: ApolloCacheManager.clearContentCache,
			});
		} catch (err) {
			throw new CustomError('Failed to insert content label links in the database', err, {
				variables,
				query: 'DELETE_CONTENT_LABEL_LINKS',
			});
		}
	}

	public static async fetchContentPages(
		page: number,
		sortColumn: ContentOverviewTableCols,
		sortOrder: Avo.Search.OrderDirection,
		tableColumnDataType: TableColumnDataType,
		where: GetContentPagesQueryVariables['where']
	): Promise<[ContentPageInfo[], number]> {
		let variables: GetContentPagesQueryVariables | null = null;
		try {
			variables = {
				where,
				offset: ITEMS_PER_PAGE * page,
				limit: ITEMS_PER_PAGE,
				orderBy: getOrderObject(
					sortColumn,
					sortOrder,
					tableColumnDataType,
					TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT
				),
			};

			const response = await dataService.query<GetContentPagesQuery>({
				query: GetContentPagesDocument,
				variables,
			});

			const dbContentPages = response.app_content;
			const dbContentPageCount: number = response.app_content_aggregate.aggregate?.count || 0;

			if (!dbContentPages) {
				throw new CustomError('Response did not contain any content pages', null, {
					response,
				});
			}

			return [convertToContentPageInfos(dbContentPages), dbContentPageCount];
		} catch (err) {
			throw new CustomError('Failed to get content pages from the database', err, {
				variables,
				query: 'GET_CONTENT_PAGES',
			});
		}
	}

	private static cleanupBeforeInsert(
		dbContentPage: Partial<Avo.ContentPage.Page>
	): Partial<Avo.ContentPage.Page> {
		return omit(dbContentPage, [
			'contentBlockssBycontentId',
			'profile',
			'__typename',
			'content_content_labels',
			'id',
		]);
	}

	public static async insertContentPage(
		contentPage: ContentPageInfo
	): Promise<Partial<ContentPageInfo> | null> {
		try {
			const dbContentPage = this.cleanupBeforeInsert(
				convertToDatabaseContentPage(contentPage)
			);
			const response = await dataService.query<InsertContentMutation>({
				query: InsertContentDocument,
				variables: {
					contentPage: dbContentPage,
				},
				update: ApolloCacheManager.clearContentCache,
			});

			const id: number | null = get(
				response,
				`data.${CONTENT_RESULT_PATH.INSERT}.returning[0].id`,
				null
			);

			if (id) {
				// Insert content-blocks
				let contentBlockConfigs: Partial<ContentBlockConfig>[] | null = null;
				if (contentPage.contentBlockConfigs && contentPage.contentBlockConfigs.length) {
					contentBlockConfigs = await ContentBlockService.insertContentBlocks(
						id,
						contentPage.contentBlockConfigs
					);

					if (!contentBlockConfigs) {
						// return null to prevent triggering success toast
						return null;
					}
				}

				return { ...contentPage, contentBlockConfigs, id } as Partial<ContentPageInfo>;
			}

			return null;
		} catch (err) {
			console.error('Failed to insert content page into the database', err);
			return null;
		}
	}

	public static async updateContentPage(
		contentPage: ContentPageInfo,
		initialContentPage?: Partial<ContentPageInfo>
	): Promise<Partial<ContentPageInfo> | null> {
		try {
			const dbContentPage = this.cleanupBeforeInsert(
				convertToDatabaseContentPage(contentPage)
			);
			const response = await dataService.query<UpdateContentByIdMutation>({
				query: UpdateContentByIdDocument,
				variables: {
					contentPage: dbContentPage,
					id: contentPage.id,
				},
				update: ApolloCacheManager.clearContentCache,
			});

			const updatedContent = get(response, 'data.update_app_content.affected_rows', null);
			if (!updatedContent) {
				throw new CustomError(
					'Content page update returned empty response',
					null,
					response
				);
			}

			if (contentPage.contentBlockConfigs && initialContentPage) {
				await ContentBlockService.updateChangedContentBlocks(
					contentPage.id as number,
					initialContentPage.contentBlockConfigs || [],
					contentPage.contentBlockConfigs
				);
			}

			return contentPage;
		} catch (err) {
			console.error('Failed to save content', err);
			return null;
		}
	}

	public static getPathOrDefault(contentPage: Partial<ContentPageInfo>): string {
		return contentPage.path || `/${kebabCase(contentPage.title)}`;
	}

	/**
	 * Remove rich text editor states, since they are also saved as html,
	 * and we don't want those states to end up in the database
	 * @param blockConfigs
	 */
	public static convertRichTextEditorStatesToHtml(
		blockConfigs: ContentBlockConfig[]
	): ContentBlockConfig[] {
		return mapDeep(
			blockConfigs,
			(obj: any, key: string | number, value: any) => {
				if (String(key).endsWith(RichEditorStateKey)) {
					const htmlKey: string = String(key).substr(
						0,
						String(key).length - RichEditorStateKey.length
					);
					let htmlFromRichTextEditor = undefined;
					if (value && value.toHTML && isFunction(value.toHTML)) {
						htmlFromRichTextEditor = value.toHTML();
					}
					obj[htmlKey] = sanitizeHtml(
						htmlFromRichTextEditor || obj[htmlKey] || '',
						'full'
					);
					delete obj[key];
				}
			},
			(key: string | number) => String(key).endsWith(RichEditorStateKey)
		);
	}

	// TODO: Make function generic so we can combine this getTitle and the one from collections.
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
		const contentPages = await ContentService.getPublicContentItemsByTitle(
			`%${titleWithoutCopy}`
		);
		const titles = (contentPages || []).map((contentPage) => contentPage.title);

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
	 * @param contentPageInfo
	 * @param copyPrefix
	 * @param copyRegex
	 * @param profileId user who will be the owner of the copy
	 *
	 * @returns Duplicate content page.
	 */
	public static async duplicateContentPage(
		contentPageInfo: ContentPageInfo,
		copyPrefix: string,
		copyRegex: RegExp,
		profileId: string
	): Promise<Partial<ContentPageInfo> | null> {
		try {
			const duplicate = { ...contentPageInfo };

			// update attributes specific to duplicate
			duplicate.thumbnail_path = null; // https://meemoo.atlassian.net/browse/AVO-1841
			duplicate.is_public = false;
			duplicate.published_at = null;
			duplicate.depublish_at = null;
			duplicate.publish_at = null;
			duplicate.path = null;
			duplicate.created_at = moment().toISOString();
			duplicate.updated_at = duplicate.created_at;
			duplicate.user_profile_id = profileId;

			try {
				duplicate.title = await this.getCopyTitleForContentPage(
					copyPrefix,
					copyRegex,
					duplicate.title
				);
			} catch (err) {
				const customError = new CustomError(
					'Failed to retrieve title for duplicate content page',
					err,
					{
						contentToInsert: duplicate,
					}
				);

				console.error(customError);

				// fallback to simple copy title
				duplicate.title = `${copyPrefix.replace(' %index%', '')}${duplicate.title}`;
			}

			// insert duplicated collection
			return await ContentService.insertContentPage(duplicate);
		} catch (err) {
			throw new CustomError('Failed to duplicate collection', err, {
				copyPrefix,
				copyRegex,
				contentPage: contentPageInfo,
			});
		}
	}

	public static async deleteContentPage(data: ContentPageInfo): Promise<void> {
		try {
			const variables: SoftDeleteContentMutationVariables = {
				id: data.id,
				path: `${DELETED_CONTENT_PAGE_PATH_PREFIX}${data.id}${data.path}`,
			};
			await dataService.query<SoftDeleteContentMutation>({
				query: SoftDeleteContentDocument,
				variables,
				update: ApolloCacheManager.clearContentCache,
			});
		} catch (err) {
			throw new CustomError('Failed to delete content page from the database', err, {
				id: data.id,
				query: 'SOFT_DELETE_CONTENT',
			});
		}
	}

	public static getDescription(
		contentPageInfo: ContentPageInfo,
		sanitizePreset: SanitizePreset = 'link'
	): string | null {
		const description = contentPageInfo.description_state
			? contentPageInfo.description_state.toHTML()
			: contentPageInfo.description_html || null;
		return description ? sanitizeHtml(description, sanitizePreset) : null;
	}
}
