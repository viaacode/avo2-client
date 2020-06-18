import { gql } from 'apollo-boost';

export const GET_ALL_ORGANISATIONS = gql`
	query getAllOrganisations {
		shared_organisations {
			or_id
			name
		}
	}
`;
