import { gql } from 'apollo-boost';

export const GET_MENUS = gql`
	{
		app_content_nav_elements(distinct_on: placement) {
			id
			description
			placement
		}
	}
`;

export const GET_MENU_ITEMS_BY_PLACEMENT = gql`
	query getMenuItemsByPlacement($placement: String!) {
		app_content_nav_elements(
			order_by: { position: asc }
			where: { placement: { _eq: $placement } }
		) {
			id
			placement
			description
			icon_name
			position
			link_target
			label
			external_link
		}
	}
`;

export const GET_MENU_ITEM_BY_ID = gql`
	query getMenuItemById($id: Int!) {
		app_content_nav_elements(where: { id: { _eq: $id } }) {
			id
			icon_name
			label
			link_target
			placement
		}
	}
`;

export const UPDATE_MENU_ITEM = '';
