import {
  AvoCollectionCollection,
  AvoCollectionFragment,
  AvoCollectionRelationEntry,
  AvoItemItem,
} from '@viaa/avo2-types';

export const getFragmentProperty = (
  itemMetaData: AvoItemItem | AvoCollectionCollection | undefined,
  fragment: AvoCollectionFragment,
  useCustomFields: boolean,
  prop: 'title' | 'description',
) => {
  return useCustomFields || !itemMetaData
    ? fragment?.[`custom_${prop}`] || ''
    : itemMetaData?.[prop] || '';
};

/**
 * Show warning to users if
 * - They are owner of the collection
 * - And the item was replaced and the collection has not been edited since the replacement
 * - And the fragment that was replaced was added to the collection before it was replaced
 * @param collection
 * @param collectionFragment
 * @param profileId
 */
export const showReplacementWarning = (
  collection: AvoCollectionCollection,
  collectionFragment: AvoCollectionFragment,
  profileId?: string,
): boolean => {
  const item = collectionFragment.item_meta as AvoItemItem;
  const replacedRelation: AvoCollectionRelationEntry<AvoItemItem> | undefined =
    item?.relations?.[0];
  const ownsCollection: boolean = collection.owner_profile_id === profileId;

  return (
    !!profileId &&
    ownsCollection &&
    !!replacedRelation &&
    new Date(replacedRelation.created_at) > new Date(collection.updated_at) &&
    new Date(replacedRelation.created_at) >
      new Date(collectionFragment.created_at)
  );
};
