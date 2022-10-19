import { ContentWidthSchema } from '@viaa/avo2-types/types/content-page';
import { UserProfile } from '@viaa/avo2-types/types/user';

import { parseContentBlocks } from '../../content-block/helpers';
import { ContentPageLabel } from '../../content-page-labels/content-page-label.types';
import {
	ContentPageDb,
	ContentPageInfo,
	ContentPageType,
	ContentPageWithBlocksDb,
	ContentWidth,
} from '../content.types';

export function convertToContentPageInfo(dbContentPage: ContentPageDb): ContentPageInfo {
	const labels: ContentPageLabel[] = (dbContentPage.content_content_labels || []).map(
		(labelLink) => labelLink.content_label
	);
	const contentBlockConfigs = (dbContentPage as ContentPageWithBlocksDb).contentBlockssBycontentId
		? parseContentBlocks((dbContentPage as ContentPageWithBlocksDb).contentBlockssBycontentId)
		: [];

	return {
		labels,
		contentBlockConfigs,
		id: dbContentPage.id,
		thumbnail_path: dbContentPage.thumbnail_path || null,
		title: dbContentPage.title,
		description_html: dbContentPage.description || '',
		description_state: undefined,
		seo_description: dbContentPage.seo_description || '',
		meta_description: dbContentPage.meta_description || '',
		is_protected: dbContentPage.is_protected,
		is_public: dbContentPage.is_public || false,
		path: dbContentPage.path || null,
		content_type: dbContentPage.content_type as ContentPageType,
		content_width: (dbContentPage.content_width || ContentWidth.REGULAR) as ContentWidth,
		publish_at: dbContentPage.publish_at || null,
		depublish_at: dbContentPage.depublish_at || null,
		published_at: dbContentPage.published_at || null,
		created_at: dbContentPage.created_at,
		updated_at: dbContentPage.updated_at || dbContentPage.created_at || null,
		user_group_ids: dbContentPage.user_group_ids,
		profile: (dbContentPage.profile || null) as UserProfile | null,
		user_profile_id: dbContentPage.user_profile_id,
	};
}

export function convertToContentPageInfos(dbContentPages: ContentPageDb[]): ContentPageInfo[] {
	return (dbContentPages || []).map(convertToContentPageInfo);
}

export function convertToDatabaseContentPage(
	contentPageInfo: ContentPageInfo
): ContentPageWithBlocksDb {
	return {
		id: contentPageInfo.id,
		thumbnail_path: contentPageInfo.thumbnail_path || null,
		title: contentPageInfo.title,
		description:
			(contentPageInfo.description_state
				? contentPageInfo.description_state.toHTML()
				: contentPageInfo.description_html) || null,
		seo_description: contentPageInfo.seo_description || null,
		meta_description: contentPageInfo.meta_description || null,
		is_protected: contentPageInfo.is_protected,
		is_public: contentPageInfo.is_public || false,
		path: contentPageInfo.path || null,
		content_type: contentPageInfo.content_type,
		content_width: contentPageInfo.content_width as ContentWidthSchema,
		publish_at: contentPageInfo.publish_at || null,
		depublish_at: contentPageInfo.depublish_at || null,
		published_at: contentPageInfo.published_at,
		created_at: contentPageInfo.created_at,
		updated_at: contentPageInfo.updated_at || null,
		user_group_ids: contentPageInfo.user_group_ids,
		profile: contentPageInfo.profile as ContentPageDb['profile'],
		user_profile_id: contentPageInfo.user_profile_id,
		contentBlockssBycontentId: [],
		content_content_labels: [],
	};
}
