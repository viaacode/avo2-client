import { SanitizePreset, sanitizeHtml } from '@meemoo/admin-core-ui/client';
import { AvoCollectionCollection } from '@viaa/avo2-types';
import { cloneDeep } from 'es-toolkit';
import { getFragmentsFromCollection } from '../../collection/collection.helpers';

export function convertRteToString(
  collection: Partial<AvoCollectionCollection> | null,
): Partial<AvoCollectionCollection> | null {
  if (!collection) {
    return collection;
  }
  const clonedCollection = cloneDeep(collection);
  getFragmentsFromCollection(clonedCollection).forEach((fragment) => {
    if (
      fragment.custom_description &&
      (fragment.custom_description as any).toHTML
    ) {
      fragment.custom_description = sanitizeHtml(
        (fragment.custom_description as any).toHTML(),
        SanitizePreset.link,
      );
    }
  });
  return clonedCollection;
}
