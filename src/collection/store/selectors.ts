import { get } from 'lodash-es';

import { CollectionsState, CollectionState } from './types';

const selectCollection = ({ collection }: { collection: CollectionState }, id: string) => {
	return get(collection, [id, 'data']);
};

const selectCollectionLoading = ({ collection }: { collection: CollectionState }, id: string) => {
	return get(collection, [id, 'loading']);
};

const selectCollectionError = ({ collection }: { collection: CollectionState }, id: string) => {
	return get(collection, [id, 'error']);
};

const selectCollections = ({ collections }: { collections: CollectionsState }) => {
	return get(collections, ['data']);
};

const selectCollectionsLoading = ({ collections }: { collections: CollectionsState }) => {
	return get(collections, ['loading']);
};

const selectCollectionsError = ({ collections }: { collections: CollectionsState }) => {
	return get(collections, ['error']);
};

export {
	selectCollection,
	selectCollectionLoading,
	selectCollectionError,
	selectCollections,
	selectCollectionsLoading,
	selectCollectionsError,
};
