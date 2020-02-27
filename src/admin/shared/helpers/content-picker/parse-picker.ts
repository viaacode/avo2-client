import { ContentPickerType, PickerItem } from '../../types';

const parseSearchQuery = (input: string) => {
	// replace %22 by "
	const replacedString = input.split('%22').join('"');

	// split on first instance of ?
	const splitString = replacedString.includes('?')
		? replacedString
				.split('?')
				.slice(1)
				.join('?')
		: replacedString;

	// parse as objects
	const output = splitString.split('&').reduce((acc: any, curr: any) => {
		const prop = curr.split('=');
		const key = decodeURIComponent(prop[0]);
		const value = decodeURIComponent(prop[1]);

		acc[key] = value[0] === '{' || value[0] === '[' ? JSON.parse(value) : value;

		return acc;
	}, {});

	return output;
};

export const parsePickerItem = (type: ContentPickerType, value: string): PickerItem => ({
	type,
	value: type === 'SEARCH_QUERY' ? parseSearchQuery(value) : value,
});
