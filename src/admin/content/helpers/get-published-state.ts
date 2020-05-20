import moment from 'moment';

import { Avo } from '@viaa/avo2-types';

import { DbContent } from '../content.types';

export const getPublishedState = (
	contentPage: Avo.Content.Content | DbContent | Partial<DbContent> | undefined | null
) => {
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
};

export const isPublic = (
	contentPage: Avo.Content.Content | DbContent | Partial<DbContent> | undefined | null
) => {
	if (!contentPage) {
		return false;
	}

	const { is_public, publish_at, depublish_at } = contentPage;

	const isTimeboundPublic = () => {
		if (publish_at && depublish_at) {
			return moment().isBetween(moment(publish_at), moment(depublish_at));
		}

		if (publish_at) {
			return moment().isAfter(moment(publish_at));
		}

		if (depublish_at) {
			return moment().isBefore(moment(depublish_at));
		}

		return false;
	};

	return is_public || isTimeboundPublic();
};
