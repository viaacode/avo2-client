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
	{
		app_content {
			content_type
			created_at
			depublish_at
			description
			id
			is_protected
			is_public
			is_published
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
