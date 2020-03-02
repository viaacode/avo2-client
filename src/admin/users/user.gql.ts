import { gql } from 'apollo-boost';

export const GET_USERS = gql`
	query getUsers(
		$offset: Int!
		$limit: Int!
		$stamboek: String!
		$mail: String!
		$alternativeEmail: String!
		$bio: String!
		$alias: String!
		$firstName: String!
		$lastName: String!
		$function: String!
	) {
		users_profiles(
			limit: $limit
			offset: $offset
			order_by: { usersByuserId: { last_name: asc, first_name: asc } }
			where: {
				_or: {
					bio: { _ilike: $bio }
					function: { _ilike: $function }
					stamboek: { _ilike: $stamboek }
					alternative_email: { _ilike: $alternativeEmail }
					alias: { _ilike: $alias }
					usersByuserId: {
						_or: {
							first_name: { _ilike: $firstName }
							last_name: { _ilike: $lastName }
							mail: { _ilike: $mail }
						}
					}
				}
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
	}
`;
