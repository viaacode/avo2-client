import { gql } from 'apollo-boost';

export const GET_AVAILABLE_CONTENT_TYPES = gql`
	{
		app_content(distinct_on: content_type) {
			content_type
		}
	}
`;

// TODO: this query should be able to
// - filter on: title, description, author, role, all dates and content type
// - order by
export const GET_CONTENT = gql`
	query getContent($limit: Int) {
		app_content(limit: $limit) {
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
		}
	}
`;
export const GET_CONTENT_TYPES = gql`
	{
		lookup_enum_content_types {
			value
		}
	}
`;
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
