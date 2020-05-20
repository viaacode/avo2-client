import moment from 'moment';

import Avo from '@viaa/avo2-types';

export const getPublishedState = (contentPage: Avo.Content.Content) => {
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
