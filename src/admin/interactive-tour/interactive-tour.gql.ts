import { gql } from 'apollo-boost';

export const GET_INTERACTIVE_TOUR_BY_ID = gql`
	query getInteractiveTourById($id: Int!) {
		app_interactive_tour(where: { id: { _eq: $id } }) {
			name
			id
			page_id: page
			created_at
			updated_at
			steps
		}
	}
`;

export const GET_INTERACTIVE_TOURS = gql`
	query getInteractiveTours(
		$limit: Int!
		$offset: Int!
		$orderBy: [app_interactive_tour_order_by!]!
		$where: app_interactive_tour_bool_exp
	) {
		app_interactive_tour(limit: $limit, offset: $offset, order_by: $orderBy, where: $where) {
			name
			id
			page_id: page
			created_at
			updated_at
		}
		app_interactive_tour_aggregate(where: $where) {
			aggregate {
				count
			}
		}
	}
`;

export const INSERT_INTERACTIVE_TOUR = gql`
	mutation insertInteractiveTour($interactiveTour: app_interactive_tour_insert_input!) {
		insert_app_interactive_tour(objects: [$interactiveTour]) {
			returning {
				id
			}
		}
	}
`;

export const UPDATE_INTERACTIVE_TOUR = gql`
	mutation updateInteractiveTour(
		$interactiveTour: app_interactive_tour_set_input!
		$interactiveTourId: Int!
	) {
		update_app_interactive_tour(
			where: { id: { _eq: $interactiveTourId } }
			_set: $interactiveTour
		) {
			affected_rows
		}
	}
`;

export const DELETE_INTERACTIVE_TOUR = gql`
	mutation deleteInteractiveTour($interactiveTourId: Int!) {
		delete_app_interactive_tour(where: { id: { _eq: $interactiveTourId } }) {
			affected_rows
		}
	}
`;
