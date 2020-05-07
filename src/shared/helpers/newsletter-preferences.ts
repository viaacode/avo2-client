import { NewsletterPreferences } from '../../shared/types';

export const convertToNewsletterPreferenceUpdate = (
	oldPreferences: NewsletterPreferences,
	newPreferences: Partial<NewsletterPreferences>
) => {
	// Convert to update object for newsletter preferences.
	console.log(oldPreferences, newPreferences);
};
