import { gql } from 'apollo-boost';

export const GET_COLLECTION_BY_ID = gql`
	query getMigrateCollectionById($id: Int!) {
		migrate_collections(where: { id: { _eq: $id } }) {
			fragments {
				id
				custom_title
				custom_description
				start_oc
				end_oc
				external_id {
					external_id
					mediamosa_id
					type_label
				}
				updated_at
				position
				created_at
			}
			description
			title
			is_public
			id
			lom_references {
				lom_value
				id
			}
			type_id
			d_ownerid
			created_at
			updated_at
			organisation_id
			mediamosa_id
		}
	}
`;
