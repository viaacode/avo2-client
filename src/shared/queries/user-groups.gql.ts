import { gql } from 'apollo-boost';

export const GET_USER_GROUPS = gql`
	query getUserGroups {
		users_groups {
			id
			label
		}
	}
`;
