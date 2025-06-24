import { type Avo } from '@viaa/avo2-types';

import { type EmbedCode } from '../embed-code.types';

/**
 * Show warning to users if
 * - And the item was replaced and the embed code has not been edited since the replacement
 * - And the fragment that was replaced was used before it was replaced
 * @param embedCode
 */
export const showFragmentReplacementWarning = (embedCode: EmbedCode | null): boolean => {
	if (!embedCode) {
		return false;
	}

	const item = embedCode?.content as Avo.Item.Item;
	const replacedRelation: Avo.Collection.RelationEntry<Avo.Item.Item> | undefined =
		item?.relations?.[0];

	return (
		!!replacedRelation &&
		new Date(replacedRelation.created_at) > new Date(embedCode.updatedAt) &&
		new Date(replacedRelation.created_at) > new Date(embedCode.createdAt)
	);
};
