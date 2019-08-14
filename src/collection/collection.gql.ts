import { gql } from 'apollo-boost';

// TODO: Reduce to only what we need.
export const GET_COLLECTION_BY_ID = gql`
	query getMigrateCollectionById($id: Int!) {
		app_collections(where: { id: { _eq: $id } }) {
			id
			collection_fragment_ids
			description
			collection_fragments {
				use_custom_fields
				updated_at
				start_oc
				position
				id
				external_id
				end_oc
				custom_title
				custom_description
				created_at
				collection_id
			}
			updated_at
			type_id
			type {
				label
				id
			}
			title
			thumbnail_path
			publish_at
			owner_id
			owner {
				updated_at
				uid
				role_id
				last_name
				id
				first_name
				email
				created_at
				profile {
					alias
					alternative_email
					avatar
					created_at
					fn
					group_id
					id
					org_id
					sn
					updated_at
					user_id
					usersByuserId {
						id
					}
				}
				role {
					id
					label
					name
					users {
						id
					}
				}
			}
			organisation_id
			is_public
			external_id
			depublish_at
			created_at
			label_redactie_id
			label_redactie {
				updated_at
				label
				id
				created_at
				alt_label
			}
			collection_permissions {
				collection_id
				created_at
				id
				permission_type
				updated_at
				user_id
			}
			lom_classification
			lom_context
			lom_intendedenduserrole
			lom_keywords
			lom_languages
			lom_typicalagerange
		}
	}
`;

export const UPDATE_COLLECTION = gql`
	mutation updateCollectionById($id: Int!, $title: String!) {
		update_app_collections(where: { id: { _eq: $id } }, _set: { title: $title }) {
			affected_rows
		}
	}
`;

export const GET_COLLECTIONS_BY_OWNER = gql`
	query getMigrateCollectionById($ownerId: uuid) {
		app_collections(where: { owner_id: { _eq: $ownerId } }) {
			id
			collection_fragment_ids
			description
			collection_fragments {
				use_custom_fields
				updated_at
				start_oc
				position
				id
				external_id
				end_oc
				custom_title
				custom_description
				created_at
				collection_id
			}
			updated_at
			type_id
			type {
				label
				id
			}
			title
			thumbnail_path
			publish_at
			owner_id
			owner {
				updated_at
				uid
				role_id
				last_name
				id
				first_name
				email
				created_at
			}
			organisation_id
			is_public
			external_id
			depublish_at
			created_at
			label_redactie_id
			label_redactie {
				updated_at
				label
				id
				created_at
				alt_label
			}
		}
	}
`;
