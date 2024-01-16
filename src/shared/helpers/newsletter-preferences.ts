import { isEmpty, isNil, keys } from 'lodash-es';

import { NewsletterPreferences } from '../services/campaign-monitor-service';
import { NewsletterList } from '../types';

export const convertToNewsletterPreferenceUpdate = (
	oldPreferences: NewsletterPreferences,
	newPreferences: Partial<NewsletterPreferences>
) => {
	// Convert to update object for newsletter preferences.
	const uniqKeys = keys(oldPreferences) as NewsletterList[];

	const convertedPreferences: Partial<NewsletterPreferences> = {};
	uniqKeys.forEach((key) => {
		if (!isNil(newPreferences[key]) && oldPreferences[key] !== newPreferences[key]) {
			convertedPreferences[key] = newPreferences[key];
		}
	});

	return isEmpty(convertedPreferences) ? null : convertedPreferences;
};
