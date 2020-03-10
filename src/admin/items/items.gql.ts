import { gql } from 'apollo-boost';

export const GET_ITEMS = gql`
	query getItems(
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
			view_counts_aggregate {
				aggregate {
					count
				}
			}
		}
	}
`;
