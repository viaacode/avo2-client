import { isEqual } from 'lodash-es';

import { NewsletterPreferences } from '../../shared/types';

export const convertToNewsletterPreferenceUpdate = (
	oldPreferences: NewsletterPreferences,
	newPreferences: Partial<NewsletterPreferences>
) => {
	// Convert to update object for newsletter preferences.

	const convertedPreferences: any = {};

	Object.entries(oldPreferences).forEach(oldPreference => {
		const oldPreferenceKey = oldPreference[0];
		const oldPreferenceValue = oldPreference[1];

		if ((newPreferences as any)[oldPreferenceKey] === oldPreferenceValue) {
			return;
		}

		if ((newPreferences as any)[oldPreferenceKey] === false && oldPreferenceValue === true) {
			convertedPreferences[oldPreferenceKey] = false;
			return;
		}

		if ((newPreferences as any)[oldPreferenceKey] === true && oldPreferenceValue === false) {
			convertedPreferences[oldPreferenceKey] = true;
			return;
		}
	});

	return isEqual(convertedPreferences, {}) ? null : convertedPreferences;
};
