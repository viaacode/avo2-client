import { gql } from 'apollo-boost';

export const GET_COLLECTIONS = gql`
	query getCollections(
		$where: app_collections_bool_exp!
		$orderBy: [app_collections_order_by!]!
		$offset: Int!
		$limit: Int!
	) {
		app_collections(where: $where, order_by: $orderBy, offset: $offset, limit: $limit) {
			id
			type_id
			updated_at
			title
			description
			is_public
			is_deleted
			created_at
			owner_profile_id
			profile {
				id
				organisation {
					logo_url
					name
					or_id
				}
				profile_user_groups {
					groups {
						label
						id
					}
				}
				user: usersByuserId {
					id
					first_name
					last_name
				}
			}
			lom_context
			lom_classification
			updated_by {
				id
				user: usersByuserId {
					id
					first_name
					last_name
					profile {
						profile_user_groups {
							groups {
								label
								id
							}
						}
					}
				}
			}
			collection_labels {
				id
				label
			}
			counts {
				bookmarks
				in_assignment
				in_collection
				views
			}
			relations_aggregate(where: { predicate: { _eq: "HAS_COPY" } }) {
				aggregate {
					count
				}
			}
		}
		app_collections_aggregate(where: $where) {
			aggregate {
				count
			}
		}
	}
`;
