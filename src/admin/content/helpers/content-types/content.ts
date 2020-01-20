import { Avo } from '@viaa/avo2-types';

import { fetchContentItems } from '../../content.services';

// Fetch content items from GQL
export const fetchContent = (limit: number = 5) => {
	return fetchContentItems(limit).then((contentItems: Avo.Content.Content[] | null) => {
		return new Promise(resolve => {
			if (!contentItems) {
				return;
			}

			resolve(parseContentItems(contentItems));
		});
	});
};

// Parse raw content items to react-select options
const parseContentItems = (raw: Avo.Content.Content[]) => {
	const parsedContentItems = raw.map((item: Avo.Content.Content) => ({
		label: item.title,
		value: {
			type: 'content',
			value: item.path,
		},
	}));

	const contentOptions = {
		label: 'content',
		options: parsedContentItems,
	};

	return contentOptions;
};
