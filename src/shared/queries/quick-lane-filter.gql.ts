import { gql } from 'apollo-boost';

export const GET_QUICK_LANE_WITH_FILTERS = gql`
	query getQuickLanesWithFilters(
		$filterString: String
		$createdAtGte: timestamptz
		$createdAtLte: timestamptz
		$updatedAtGte: timestamptz
		$updatedAtLte: timestamptz
		$filters: [app_quick_lanes_bool_exp]
		$orderBy: [app_quick_lanes_order_by!]
	) {
		app_quick_lanes(
			where: {
				_and: [
					{
						_or: [
							{ title: { _ilike: $filterString } }
							{
								owner: {
									_or: [
										{ usersByuserId: { first_name: { _ilike: $filterString } } }
										{ usersByuserId: { last_name: { _ilike: $filterString } } }
									]
								}
							}
						]
					}
					{ created_at: { _gte: $createdAtGte, _lte: $createdAtLte } }
					{ updated_at: { _gte: $updatedAtGte, _lte: $updatedAtLte } }
					{ _and: $filters }
				]
			}
			order_by: $orderBy
		) {
			id
			content_id
			content_label
			title
			view_mode
			created_at
			updated_at
			owner {
				id
				avatar
				user: usersByuserId {
					full_name
					first_name
					last_name
				}
				organisation {
					name
					logo_url
				}
			}
		}
	}
`;
