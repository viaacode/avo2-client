import {
  AvoCoreContentPickerType,
  AvoCoreContentTypeId,
} from '@viaa/avo2-types';
import { CollectionService } from '../../../../../collection/collection.service';
import { type Collection } from '../../../../../collection/collection.types';
import { type PickerItem } from '../../../types/content-picker';
import { parsePickerItem } from '../helpers/parse-picker';

// TODO: move fetchBundles and fetchBundlesByTitle to a separate bundle service, not collection service.

// fetch collections by title-wildcard
export const retrieveCollections = async (
  titleOrId: string | null,
  limit = 5,
): Promise<PickerItem[]> => {
  const collections: Collection[] | null = titleOrId
    ? await CollectionService.fetchCollectionsByTitleOrId(titleOrId, limit)
    : await CollectionService.fetchCollectionsOrBundles(
        limit,
        AvoCoreContentTypeId.COLLECTION,
      );

  return parseCollections(
    AvoCoreContentPickerType.COLLECTION,
    collections || [],
  );
};

// fetch bundles by title-wildcard
export const retrieveBundles = async (
  titleOrId: string | null,
  limit = 5,
): Promise<PickerItem[]> => {
  const bundles: Collection[] | null = titleOrId
    ? await CollectionService.fetchBundlesByTitleOrId(titleOrId, limit)
    : await CollectionService.fetchCollectionsOrBundles(
        limit,
        AvoCoreContentTypeId.BUNDLE,
      );

  return parseCollections(AvoCoreContentPickerType.BUNDLE, bundles || []);
};

// parse raw data to react-select options
const parseCollections = (
  type: AvoCoreContentPickerType,
  raw: Collection[],
): PickerItem[] => {
  return raw.map(
    (item: Collection): PickerItem => ({
      ...parsePickerItem(type, item.id.toString()),
      label: item.title || '',
    }),
  );
};
