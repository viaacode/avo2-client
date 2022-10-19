import {
	GetPublicItemsByTitleOrExternalIdQuery,
	GetPublicItemsQuery,
} from '../generated/graphql-db-types';

export type ItemMeta =
	| GetPublicItemsQuery['app_item_meta'][0]
	| GetPublicItemsByTitleOrExternalIdQuery['itemsByExternalId'][0]
	| GetPublicItemsByTitleOrExternalIdQuery['itemsByTitle'][0];
