import { MAX_SEARCH_DESCRIPTION_LENGTH } from './collection.const';

export const isMediaFragment = (fragmentInfo: { external_id: string | undefined }) => {
	return fragmentInfo.external_id && fragmentInfo.external_id !== '-1';
};

export const getValidationFeedbackForShortDescription = (
	description: string | null,
	isError?: boolean | null
): string => {
	const count = `${(description || '').length}/${MAX_SEARCH_DESCRIPTION_LENGTH}`;

	const exceedsSize: boolean = (description || '').length > MAX_SEARCH_DESCRIPTION_LENGTH;

	if (isError) {
		return exceedsSize ? `De korte omschrijving is te lang. ${count}` : '';
	}

	return exceedsSize ? '' : `${(description || '').length}/${MAX_SEARCH_DESCRIPTION_LENGTH}`;
};
