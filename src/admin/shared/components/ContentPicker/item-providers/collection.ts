import { Avo } from '@viaa/avo2-types'

import { CollectionService } from '../../../../../collection/collection.service.js'
import {
  type Collection,
  ContentTypeNumber,
} from '../../../../../collection/collection.types.js'
import { type PickerItem } from '../../../types/content-picker.js'
import { parsePickerItem } from '../helpers/parse-picker.js'

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
        ContentTypeNumber.collection,
      )

  return parseCollections(
    Avo.Core.ContentPickerType.COLLECTION,
    collections || [],
  )
}

// fetch bundles by title-wildcard
export const retrieveBundles = async (
  titleOrId: string | null,
  limit = 5,
): Promise<PickerItem[]> => {
  const bundles: Collection[] | null = titleOrId
    ? await CollectionService.fetchBundlesByTitleOrId(titleOrId, limit)
    : await CollectionService.fetchCollectionsOrBundles(
        limit,
        ContentTypeNumber.bundle,
      )

  return parseCollections(Avo.Core.ContentPickerType.BUNDLE, bundles || [])
}

// parse raw data to react-select options
const parseCollections = (
  type: Avo.Core.ContentPickerType,
  raw: Collection[],
): PickerItem[] => {
  return raw.map(
    (item: Collection): PickerItem => ({
      ...parsePickerItem(type, item.id.toString()),
      label: item.title || '',
    }),
  )
}
