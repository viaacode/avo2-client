import { type ItemMeta } from '../../../../../shared/types/item.js'
import { ItemsService } from '../../../../items/items.service.js'
import { type PickerItem } from '../../../types/content-picker.js'
import { parsePickerItem } from '../helpers/parse-picker.js'
import { Avo } from '@viaa/avo2-types'

// Fetch content items from GQL
export const retrieveItems = async (
  titleOrExternalId: string | null,
  limit = 5,
): Promise<PickerItem[]> => {
  const items: ItemMeta[] | null = titleOrExternalId
    ? await ItemsService.fetchPublicItemsByTitleOrExternalId(
        titleOrExternalId,
        limit,
      )
    : await ItemsService.fetchPublicItems(limit)

  return parseItems(items || [])
}

// Parse raw content items to react-select options
const parseItems = (raw: ItemMeta[]): PickerItem[] => {
  return raw.map((item: ItemMeta): PickerItem => {
    return {
      ...parsePickerItem(
        Avo.Core.ContentPickerType.ITEM,
        item.external_id.toString(),
      ),
      label: item.title,
    }
  })
}
