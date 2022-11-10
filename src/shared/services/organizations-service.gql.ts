import { gql } from 'apollo-boost';

export const GET_ALL_ORGANISATIONS = gql`
	query getAllOrganisations {
		shared_organisations(order_by: { name: asc }) {
			or_id
			name
			logo_url
		}
	}
`;

export const GET_DISTINCT_ORGANISATIONS = gql`
	query getDistinctOrganisations {
		app_item_meta(distinct_on: org_id, where: { organisation: {} }) {
			organisation {
				or_id
				name
				logo_url
			}
			is_published
			is_deleted
		}
	}
`;

export const GET_ORGANISATIONS_WITH_USERS = gql`
	query getOrganisationsWithUsers {
		shared_organisations_with_users {
			or_id: company_id
			name
		}
	}
`;

export const GET_USERS_IN_COMPANY = gql`
	query getUsersByCompanyId($companyId: String!) {
		users_profiles(
			order_by: { usersByuserId: { first_name: asc } }
			where: { company_id: { _eq: $companyId }, is_deleted: { _eq: false } }
		) {
			id
			user: usersByuserId {
				uid
				full_name
				mail
				is_blocked
				last_access_at
				temp_access {
					from
					until
				}
			}
			profile_user_group {
				group {
					id
					label
				}
			}
		}
	}
`;
