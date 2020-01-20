import { Avo } from '@viaa/avo2-types';

import { CollectionService } from '../../../../collection/collection.service';

// Fetch content items from GQL
export const fetchCollections = (limit: number = 5) => {
	return CollectionService.getCollections(limit).then(
		(collections: Partial<Avo.Collection.Collection>[]) => {
			return new Promise(resolve => {
				if (!collections) {
					return;
				}

				resolve(parseCollections(collections));
			});
		}
	);
};

// Parse raw content items to react-select options
const parseCollections = (raw: Partial<Avo.Collection.Collection>[]) => {
	const parsedCollections = raw.map((item: Partial<Avo.Collection.Collection>) => ({
		label: item.title,
		value: {
			type: 'collection',
			value: item.id,
		},
	}));

	const collectionOptions = {
		label: 'collections',
		options: parsedCollections,
	};

	return collectionOptions;
};
