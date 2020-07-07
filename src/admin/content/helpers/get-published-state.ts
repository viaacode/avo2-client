import moment from 'moment';

import { ContentPageInfo } from '../content.types';

export function getPublishedState(
	contentPage: ContentPageInfo | Partial<ContentPageInfo> | undefined | null
) {
	if (!contentPage) {
		return 'private';
	}

	const { is_public, publish_at, depublish_at } = contentPage;

	if (is_public) {
		return 'public';
	}

	if (publish_at || depublish_at) {
		return 'timebound';
	}

	return 'private';
}

export function getPublishedDate(
	contentPage: ContentPageInfo | Partial<ContentPageInfo> | undefined | null
): string | null {
	if (!contentPage) {
		return null;
	}

	const { published_at, publish_at, depublish_at } = contentPage;

	if (published_at) {
		return published_at;
	}

	if (publish_at && depublish_at) {
		if (moment().isBetween(moment(publish_at), moment(depublish_at))) {
			return publish_at;
		}
		return null;
	}

	if (publish_at) {
		if (moment().isAfter(moment(publish_at))) {
			return publish_at;
		}
		return null;
	}

	if (depublish_at) {
		if (moment().isBefore(moment(depublish_at))) {
			return new Date().toISOString();
		}
		return null;
	}

	return null;
}

export function isPublic(
	contentPage: ContentPageInfo | Partial<ContentPageInfo> | undefined | null
): boolean {
	return !!getPublishedDate(contentPage);
}
