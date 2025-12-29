import { AvoCoreBlockItemType } from '@viaa/avo2-types';
import { tText } from '../../shared/helpers/translate-text';
import { type ReorderType } from './CollectionOrBundleEdit.types';

export const REORDER_TYPE_TO_FRAGMENT_TYPE: Record<
  ReorderType,
  AvoCoreBlockItemType | undefined
> = {
  COLLECTION_FRAGMENTS: undefined,
  BUNDLE_COLLECTION_FRAGMENTS: AvoCoreBlockItemType.COLLECTION,
  BUNDLE_ASSIGNMENT_FRAGMENTS: AvoCoreBlockItemType.ASSIGNMENT,
};

export function GET_REORDER_TYPE_TO_BUTTON_LABEL() {
  return {
    COLLECTION_FRAGMENTS: tText(
      'collection/components/collection-or-bundle-edit___herorden-onderdelen',
    ),
    BUNDLE_COLLECTION_FRAGMENTS: tText(
      'collection/components/collection-or-bundle-edit___herorden-collecties',
    ),
    BUNDLE_ASSIGNMENT_FRAGMENTS: tText(
      'collection/components/collection-or-bundle-edit___herorden-opdrachten',
    ),
  };
}
