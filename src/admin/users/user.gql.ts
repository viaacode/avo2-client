import { gql } from 'apollo-boost';

export const GET_USER_BY_ID = gql`
	query getUsers($id: uuid!) {
		users_profiles(offset: 0, limit: 1, where: { id: { _eq: $id } }) {
			id
			user: usersByuserId {
				uid
				id
				first_name
				last_name
				mail
				is_blocked
				idpmaps(where: { idp: { _eq: HETARCHIEF } }) {
					id
					idp_user_id
					idp
				}
			}
			avatar
			alias
			title
			stamboek
			updated_at
			created_at
			bio
			alternative_email
			company_id
			organisation {
				logo_url
				name
				or_id
			}
			is_exception
			title
			profile_classifications {
				key
			}
			profile_contexts {
				key
			}
			profile_organizations {
				unit_id
				organization_id
			}
			profile_user_groups {
				groups {
					id
					label
					group_user_permission_groups {
						permission_group {
							permission_group_user_permissions {
								permission {
									label
									id
								}
							}
							id
							label
						}
					}
				}
			}
		}
	}
`;

export const GET_USERS = gql`
	query getUsers(
		$offset: Int!
		$limit: Int!
		$orderBy: [users_profiles_order_by!]!
		$where: users_profiles_bool_exp!
	) {
		users_profiles(offset: $offset, limit: $limit, order_by: $orderBy, where: $where) {
			id
			user: usersByuserId {
				first_name
				last_name
				mail
				idpmaps(where: { idp: { _eq: HETARCHIEF } }) {
					idp_user_id
					id
				}
				id
				last_access_at
				is_blocked
			}
			avatar
			alias
			title
			stamboek
			updated_at
			created_at
			bio
			alternative_email
			company_id
			organisation {
				logo_url
				name
				or_id
			}
			is_exception
			title
			profile_user_groups {
				groups {
					label
					id
				}
			}
		}
		users_profiles_aggregate(where: $where) {
			aggregate {
				count
			}
		}
	}
`;

export const UPDATE_USER_BLOCKED_STATUS = gql`
	mutation updateUserBlockedStatus($userId: uuid!, $isBlocked: Boolean!) {
		update_shared_users(where: { uid: { _eq: $userId } }, _set: { is_blocked: $isBlocked }) {
			affected_rows
		}
	}
`;
