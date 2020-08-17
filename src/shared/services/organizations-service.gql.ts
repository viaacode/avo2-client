import { gql } from 'apollo-boost';

export const GET_ALL_ORGANISATIONS = gql`
	query getAllOrganisations {
		shared_organisations(order_by: { name: asc }) {
			or_id
			name
		}
	}
`;
