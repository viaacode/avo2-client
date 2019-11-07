import { gql } from 'apollo-boost';

import { ITEMS_PER_PAGE } from '../workspace/workspace.const';

// TODO: Reduce to only what we need.
export const GET_COLLECTION_BY_ID = gql`
	query getCollectionById($id: Int!) {
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
				item_meta {
					id
					duration
					title
					description
					thumbnail_path
					type {
						id
						label
					}
				}
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
			note
			thumbnail_path
			publish_at
			owner_profile_id
			profile {
				alias
				alternative_email
				avatar
				id
				location
				stamboek
				updated_at
				user_id
				user: usersByuserId {
					id
					created_at
					expires_at
					external_uid
					first_name
					last_name
					mail
					organisation_id
					role_id
					type
					uid
					updated_at
					role {
						id
						name
						label
					}
				}
				created_at
				updated_at
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
	mutation updateCollectionById($id: Int!, $collection: app_collections_set_input!) {
		update_app_collections(where: { id: { _eq: $id } }, _set: $collection) {
			affected_rows
		}
	}
`;

export const INSERT_COLLECTION = gql`
	mutation insertCollection($collection: app_collections_insert_input!) {
		insert_app_collections(objects: [$collection]) {
			affected_rows
			returning {
				id
				title
				collection_fragments {
					id
				}
			}
		}
	}
`;

export const DELETE_COLLECTION = gql`
	mutation deleteCollectionById($id: Int!) {
		delete_app_collections(where: { id: { _eq: $id } }) {
			affected_rows
		}
	}
`;

export const UPDATE_COLLECTION_FRAGMENT = gql`
	mutation updateCollectionById($id: Int!, $fragment: app_collection_fragments_set_input!) {
		update_app_collection_fragments(where: { id: { _eq: $id } }, _set: $fragment) {
			affected_rows
		}
	}
`;

export const DELETE_COLLECTION_FRAGMENT = gql`
	mutation deleteCollectionFragmentById($id: Int!) {
		delete_app_collection_fragments(where: { id: { _eq: $id } }) {
			affected_rows
		}
	}
`;

export const INSERT_COLLECTION_FRAGMENT = gql`
	mutation insertCollectionFragment($id: Int!, $fragment: app_collection_fragments_insert_input!) {
		insert_app_collection_fragments(objects: [$fragment]) {
			affected_rows
			returning {
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
		}
	}
`;

export const GET_COLLECTIONS_BY_OWNER = gql`
	query getCollectionsByOwner($owner_profile_id: uuid, $offset: Int = 0, $limit: Int = ${ITEMS_PER_PAGE}) {
		app_collections(where: { owner_profile_id: { _eq: $owner_profile_id } }, offset: $offset, limit: $limit) {
			id
			updated_at
			type_id
			type {
				label
				id
			}
			title
			publish_at
			profile {
				id
				alias
				alternative_email
				avatar
				created_at
				location
				stamboek
				updated_at
				user_id
				user: usersByuserId {
				  id
					first_name
					last_name
					role {
						id
						label
					}
				}
			}
			is_public
			external_id
			depublish_at
			created_at
			thumbnail_path
			collection_permissions {
				collection_id
				created_at
				id
				permission_type
				updated_at
				user_id
			}
		}
	}
`;

export const GET_COLLECTION_TITLES_BY_OWNER = gql`
	query getCollectionNamesByOwner($owner_profile_id: uuid) {
		app_collections(where: { owner_profile_id: { _eq: $owner_profile_id } }) {
			id
			title
		}
	}
`;

export const GET_CLASSIFICATIONS_AND_SUBJECTS = gql`
	{
		lookup_enum_lom_context {
			description
		}
		lookup_enum_lom_classification {
			description
		}
	}
`;
