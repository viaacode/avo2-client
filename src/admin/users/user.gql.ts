import { gql } from 'apollo-boost';

export const GET_USERS = gql`
	query getUsers($offset: Int!, $limit: Int!, $queryText: String!) {
		users_profiles(
			offset: $offset
			limit: $limit
			order_by: { usersByuserId: { last_name: asc, first_name: asc } }
			where: {
				_or: [
					{ stamboek: { _ilike: $queryText } }
					{ alternative_email: { _ilike: $queryText } }
					{ bio: { _ilike: $queryText } }
					{ alias: { _ilike: $queryText } }
					{ function: { _ilike: $queryText } }
					{
						usersByuserId: {
							_or: [
								{ first_name: { _ilike: $queryText } }
								{ last_name: { _ilike: $queryText } }
								{ mail: { _ilike: $queryText } }
							]
						}
					}
				]
			}
		) {
			id
			usersByuserId {
				first_name
				last_name
				mail
				idpmaps(where: { idp: { _eq: HETARCHIEF } }) {
					idp_user_id
				}
			}
			function
			avatar
			alias
			stamboek
			updated_at
			created_at
			bio
			alternative_email
		}
		users_profiles_aggregate(
			where: {
				_or: [
					{ stamboek: { _ilike: $queryText } }
					{ alternative_email: { _ilike: $queryText } }
					{ bio: { _ilike: $queryText } }
					{ alias: { _ilike: $queryText } }
					{ function: { _ilike: $queryText } }
					{
						usersByuserId: {
							_or: [
								{ first_name: { _ilike: $queryText } }
								{ last_name: { _ilike: $queryText } }
								{ mail: { _ilike: $queryText } }
							]
						}
					}
				]
			}
		) {
			aggregate {
				count
			}
		}
	}
`;
