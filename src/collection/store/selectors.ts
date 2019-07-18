import { get } from 'lodash-es';

import { CollectionState } from './types';

const selectCollection = ({ collection }: { collection: CollectionState }, id: string) => {
	return get(collection, [id, 'data']);
};

const selectCollectionLoading = ({ collection }: { collection: CollectionState }, id: string) => {
	return get(collection, [id, 'loading']);
};

const selectCollectionError = ({ collection }: { collection: CollectionState }, id: string) => {
	return get(collection, [id, 'error']);
};

export { selectCollection, selectCollectionLoading, selectCollectionError };
