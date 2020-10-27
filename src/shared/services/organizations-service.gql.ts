import { gql } from 'apollo-boost';

export const GET_ALL_ORGANISATIONS = gql`
	query getAllOrganisations {
		shared_organisations(order_by: { name: asc }) {
			or_id
			name
		}
	}
`;

export const GET_USERS_IN_COMPANY = gql`
	query getUsersByCompanyId($companyId: String!) {
		users_profiles(
			order_by: { usersByuserId: { first_name: asc } }
			where: { company_id: { _eq: $companyId } }
		) {
			id
			user: usersByuserId {
				full_name
				mail
				is_blocked
				last_access_at
			}
			profile_user_groups {
				groups(limit: 1) {
					label
					id
				}
			}
		}
	}
`;
