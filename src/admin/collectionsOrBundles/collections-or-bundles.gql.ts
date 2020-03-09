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
			is_public
			is_deleted
			created_at
			profile {
				usersByuserId {
					first_name
					last_name
					role {
						label
					}
				}
			}
			view_counts {
				count
			}
			lom_context
			lom_classification
		}
		app_collections_aggregate(where: $where) {
			aggregate {
				count
			}
		}
	}
`;
