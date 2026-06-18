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
    if (fragment.custom_description) {
      fragment.custom_description = sanitizeHtml(
        String(fragment.custom_description),
        SanitizePreset.link,
      );
    }
  });
  return clonedCollection;
}
