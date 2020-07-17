import { gql } from 'apollo-boost';

export const GET_ITEMS_WITH_FILTERS = gql`
	query getItemsWithFilters(
		$where: app_item_meta_bool_exp!
		$orderBy: [app_item_meta_order_by!]!
		$offset: Int!
		$limit: Int!
	) {
		app_item_meta(where: $where, order_by: $orderBy, offset: $offset, limit: $limit) {
			created_at
			depublish_at
			description
			duration
			expiry_date
			external_id
			uid
			is_deleted
			is_published
			issued
			lom_classification
			lom_context
			lom_intendedenduserrole
			lom_keywords
			lom_languages
			lom_typicalagerange
			org_id
			organisation {
				or_id
				name
			}
			publish_at
			published_at
			series
			title
			type {
				id
				label
			}
			updated_at
			note
			view_counts_aggregate {
				aggregate {
					sum {
						count
					}
				}
			}
		}
		app_item_meta_aggregate(where: $where) {
			aggregate {
				count
			}
		}
	}
`;

export const GET_ITEM_BY_UUID = gql`
	query getItemByUuid($uuid: uuid!) {
		app_item_meta(where: { uid: { _eq: $uuid } }) {
			thumbnail_path
			created_at
			depublish_at
			description
			duration
			expiry_date
			external_id
			uid
			is_deleted
			is_published
			issued
			lom_classification
			lom_context
			lom_intendedenduserrole
			lom_keywords
			lom_languages
			lom_typicalagerange
			org_id
			organisation {
				or_id
				name
			}
			publish_at
			published_at
			series
			title
			type {
				id
				label
			}
			updated_at
			note
			view_counts_aggregate {
				aggregate {
					sum {
						count
					}
				}
			}
		}
	}
`;

export const UPDATE_ITEM_PUBLISH_STATE = gql`
	mutation updateItemPublishedState($itemUuid: uuid!, $isPublished: Boolean!) {
		update_app_item_meta(
			where: { uid: { _eq: $itemUuid } }
			_set: { is_published: $isPublished }
		) {
			affected_rows
		}
	}
`;

export const UPDATE_ITEM_NOTES = gql`
	mutation updateItemPublishedState($itemUuid: uuid!, $note: String) {
		update_app_item_meta(where: { uid: { _eq: $itemUuid } }, _set: { note: $note }) {
			affected_rows
		}
	}
`;

export const GET_ITEMS = gql`
	query getItems($limit: Int!) {
		app_item_meta(order_by: { title: asc }, limit: $limit) {
			external_id
			title
		}
	}
`;

export const GET_ITEMS_BY_TITLE_OR_EXTERNAL_ID = gql`
	query getItemsByTitleOrExternalId($title: String!, $externalId: bpchar!, $limit: Int!) {
		itemsByTitle: app_item_meta(
			order_by: { title: asc }
			limit: $limit
			where: { title: { _ilike: $title } }
		) {
			external_id
			title
		}
		itemsByExternalId: app_item_meta(
			order_by: { title: asc }
			limit: $limit
			where: { external_id: { _eq: $externalId } }
		) {
			external_id
			title
		}
	}
`;

export const GET_ITEM_BY_EXTERNAL_ID = gql`
	query getItemByExternalId($externalId: bpchar!) {
		app_item_meta(where: { external_id: { _eq: $externalId } }) {
			browse_path
			created_at
			depublish_at
			description
			duration
			expiry_date
			external_id
			id
			uid
			is_deleted
			is_orphaned
			is_published
			issued
			issued_edtf
			lom_classification
			lom_context
			lom_intendedenduserrole
			lom_keywords
			lom_languages
			lom_typicalagerange
			org_id
			organisation {
				or_id
				name
				logo_url
			}
			publish_at
			published_at
			series
			thumbnail_path
			title
			type {
				id
				label
			}
			type_id
			updated_at
			note
			view_counts_aggregate {
				aggregate {
					sum {
						count
					}
				}
			}
		}
	}
`;
