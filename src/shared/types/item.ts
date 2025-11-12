import {
  type GetPublicItemsByTitleOrExternalIdQuery,
  type GetPublicItemsQuery,
} from '../generated/graphql-db-operations.js'

export type ItemMeta =
  | GetPublicItemsQuery['app_item_meta'][0]
  | GetPublicItemsByTitleOrExternalIdQuery['itemsByExternalId'][0]
  | GetPublicItemsByTitleOrExternalIdQuery['itemsByTitle'][0]
