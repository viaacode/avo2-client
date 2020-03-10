import { gql } from 'apollo-boost';

export const GET_AVAILABLE_CONTENT_TYPES = gql`
	{
		app_content(distinct_on: content_type) {
			content_type
		}
	}
`;

export const GET_CONTENT_PAGES = gql`
	query getContent(
		$where: app_content_bool_exp
		$offset: Int = 0
		$limit: Int = 10
		$orderBy: [app_content_order_by!] = {}
	) {
		app_content(where: $where, limit: $limit, offset: $offset, order_by: $orderBy) {
			content_type
			created_at
			depublish_at
			description
			id
			is_protected
			is_public
			is_published
			path
			profile {
				user: usersByuserId {
					first_name
					last_name
					role {
						id
						label
					}
				}
			}
			publish_at
			title
			updated_at
			user_group_ids
			user_profile_id
		}
		app_content_aggregate(where: $where) {
			aggregate {
				count
			}
		}
	}
`;

export const GET_CONTENT_PAGES_BY_TITLE = gql`
	query getContent($title: String!, $limit: Int = 20, $order: [app_content_order_by!] = {}) {
		app_content(where: { title: { _ilike: $title } }, limit: $limit, order_by: $order) {
			path
			title
		}
	}
`;

export const GET_CONTENT_PAGES_WITH_BLOCKS = gql`
	query getContent(
		$where: app_content_bool_exp
		$offset: Int = 0
		$limit: Int = 10
		$order: [app_content_order_by!] = {}
	) {
		app_content(where: $where, limit: $limit, offset: $offset, order_by: $order) {
			content_type
			created_at
			depublish_at
			description
			id
			is_protected
			is_public
			is_published
			path
			profile {
				user: usersByuserId {
					first_name
					last_name
					role {
						id
						label
					}
				}
			}
			publish_at
			title
			updated_at
			contentBlockssBycontentId(order_by: { position: asc }) {
				content_block_type
				content_id
				created_at
				id
				position
				updated_at
				variables
				enum_content_block_type {
					description
					value
				}
			}
		}
		app_content_aggregate(where: $where) {
			aggregate {
				count
			}
		}
	}
`;

export const GET_CONTENT_BY_ID = gql`
	query getContentById($id: Int!) {
		app_content(where: { id: { _eq: $id } }) {
			content_type
			created_at
			depublish_at
			description
			id
			is_protected
			is_public
			is_published
			path
			profile {
				user: usersByuserId {
					first_name
					last_name
					role {
						id
						label
					}
				}
			}
			publish_at
			title
			updated_at
			user_group_ids
		}
	}
`;

export const GET_CONTENT_TYPES = gql`
	{
		lookup_enum_content_types {
			value
			description
		}
	}
`;

// export const GET_LABELS_FOR_CONTENT_TYPE = gql`
// 	{
// 		// TODO implement once this has been added to the database
// 	}
// `;

export const UPDATE_CONTENT_BY_ID = gql`
	mutation updateContentById($id: Int!, $contentItem: app_content_set_input!) {
		update_app_content(where: { id: { _eq: $id } }, _set: $contentItem) {
			affected_rows
		}
	}
`;

export const INSERT_CONTENT = gql`
	mutation insertContent($contentItem: app_content_insert_input!) {
		insert_app_content(objects: [$contentItem]) {
			returning {
				id
			}
		}
	}
`;

export const DELETE_CONTENT = gql`
	mutation deleteContent($id: Int!) {
		delete_app_content(where: { id: { _eq: $id } }) {
			affected_rows
		}
	}
`;

export const GET_PERMISSIONS_FROM_CONTENT_PAGE_BY_PATH = gql`
	query GetPermissionsFromContentPageByPath($path: String!) {
		app_content(where: { path: { _eq: $path } }) {
			user_group_ids
		}
	}
`;
