import {Avo} from '@viaa/avo2-types';

import {tText} from '../../shared/helpers/translate-text.js';

import {type ReorderType} from './CollectionOrBundleEdit.types.js';
import {CollectionFragmentType} from "@viaa/avo2-types/dist/modules/collection.d.ts";

export const REORDER_TYPE_TO_FRAGMENT_TYPE: Record<
	ReorderType,
	Avo.Core.BlockItemType | undefined
> = {
	COLLECTION_FRAGMENTS: undefined,
	BUNDLE_COLLECTION_FRAGMENTS: CollectionFragmentType.COLLECTION,
	BUNDLE_ASSIGNMENT_FRAGMENTS: CollectionFragmentType.ASSIGNMENT,
};

export function GET_REORDER_TYPE_TO_BUTTON_LABEL() {
	return {
		COLLECTION_FRAGMENTS: tText(
			'collection/components/collection-or-bundle-edit___herorden-onderdelen'
		),
		BUNDLE_COLLECTION_FRAGMENTS: tText(
			'collection/components/collection-or-bundle-edit___herorden-collecties'
		),
		BUNDLE_ASSIGNMENT_FRAGMENTS: tText(
			'collection/components/collection-or-bundle-edit___herorden-opdrachten'
		),
	};
}
