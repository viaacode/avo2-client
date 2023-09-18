import { type Avo } from '@viaa/avo2-types';
import { get } from 'lodash-es';

export const getFragmentProperty = (
	itemMetaData: Avo.Item.Item | Avo.Collection.Collection | undefined,
	fragment: Avo.Collection.Fragment,
	useCustomFields: boolean,
	prop: 'title' | 'description'
) => {
	return useCustomFields || !itemMetaData
		? get(fragment, `custom_${prop}`, '')
		: get(itemMetaData, prop, '');
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
	collection: Avo.Collection.Collection,
	collectionFragment: Avo.Collection.Fragment,
	profileId?: string
): boolean => {
	const item = collectionFragment.item_meta as Avo.Item.Item;
	const replacedRelation: Avo.Collection.RelationEntry<Avo.Item.Item> | undefined =
		item?.relations?.[0];
	const ownsCollection: boolean = collection.owner_profile_id === profileId;

	return (
		!!profileId &&
		ownsCollection &&
		!!replacedRelation &&
		new Date(replacedRelation.created_at) > new Date(collection.updated_at) &&
		new Date(replacedRelation.created_at) > new Date(collectionFragment.created_at)
	);
};
