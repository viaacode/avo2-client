import { gql } from 'apollo-boost';

export const GET_ITEMS = gql`
	query getItems($limit: Int!) {
		app_item_meta(order_by: { title: asc }, limit: $limit) {
			external_id
			title
		}
	}
`;

export const GET_ITEMS_BY_TITLE_OR_EXTERNAL_ID = gql`
	query getItems($title: String!, $externalId: bpchar!, $limit: Int!) {
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

export const GET_ITEM_BY_ID = gql`
	query getItemById($id: bpchar!) {
		app_item_meta(where: { external_id: { _eq: $id } }) {
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
		}
	}
`;

export const GET_EXTERNAL_ID_BY_MEDIAMOSA_ID = gql`
	query getExternalIdByMediaMosaId($mediamosaId: String!) {
		migrate_reference_ids(where: { mediamosa_id: { _eq: $mediamosaId } }) {
			external_id
			id
		}
	}
`;
