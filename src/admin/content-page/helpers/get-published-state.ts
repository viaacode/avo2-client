import { ContentPageInfo } from '@meemoo/admin-core-ui';
import moment from 'moment';

export function getPublishedDate(
	contentPage: Partial<ContentPageInfo> | undefined | null
): string | null {
	if (!contentPage) {
		return null;
	}

	const { isPublic, publishedAt, publishAt, depublishAt } = contentPage;

	if (isPublic && publishedAt) {
		return publishedAt;
	}

	if (publishAt && depublishAt) {
		if (moment().isBetween(moment(publishAt), moment(depublishAt))) {
			return publishAt;
		}
		return null;
	}

	if (publishAt) {
		if (moment().isAfter(moment(publishAt))) {
			return publishAt;
		}
		return null;
	}

	if (depublishAt) {
		if (moment().isBefore(moment(depublishAt))) {
			return new Date().toISOString();
		}
		return null;
	}

	return null;
}

export function isPublic(contentPage: Partial<ContentPageInfo> | undefined | null): boolean {
	return !!getPublishedDate(contentPage);
}
