import { gql } from 'apollo-boost';

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
