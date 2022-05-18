import { gql } from 'apollo-boost';

export const GET_USER_BY_ID = gql`
	query getUserById($id: uuid!) {
		users_summary_view(
			offset: 0
			limit: 1
			where: { profile_id: { _eq: $id }, is_deleted: { _eq: false } }
		) {
			profile_id
			user_id
			first_name
			last_name
			business_category
			last_access_at
			mail
			is_blocked
			is_deleted
			is_exception
			stamboek
			acc_updated_at
			acc_created_at
			idps {
				id
				idp
				idp_user_id
			}
			profile {
				avatar
				alias
				title
				business_category
				updated_at
				created_at
				bio
				alternative_email
				usersByuserId {
					full_name
					first_name
					last_name
					mail
				}
				profile_organizations {
					unit_id
					organization_id
				}
				organisation {
					logo_url
					name
				}
				profile_user_group {
					group {
						created_at
						description
						id
						label
						ldap_role
						updated_at
						group_user_permission_groups {
							group {
								label
								id
							}
							permission_group {
								permission_group_user_permissions {
									permission {
										label
										id
									}
								}
								label
								id
							}
						}
					}
				}
				user_id
			}
			contexts {
				id
				key
			}
			group_id
			group_name
			company_name
			company_id
			blocked_at {
				max
			}
			unblocked_at {
				max
			}
			classifications {
				id
				key
			}
			organisations {
				organization_id
				unit_id
				organization {
					ldap_description
				}
			}
			user {
				temp_access {
					from
					until
					current {
						status
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
		$orderBy: [users_summary_view_order_by!]!
		$where: users_summary_view_bool_exp!
	) {
		users_summary_view(offset: $offset, limit: $limit, order_by: $orderBy, where: $where) {
			user_id
			full_name
			first_name
			last_name
			mail
			last_access_at
			is_blocked
			blocked_at {
				date: max
			}
			unblocked_at {
				date: max
			}
			profile_id
			stamboek
			acc_created_at
			group_id
			group_name
			company_name
			is_exception
			business_category
			idps {
				idp
			}
			classifications {
				key
			}
			contexts {
				key
			}
			organisations {
				organization_id
				unit_id
				organization {
					ldap_description
				}
			}
			user {
				temp_access {
					until
					from
					current {
						status
					}
				}
			}
		}
		users_summary_view_aggregate(where: $where) {
			aggregate {
				count
			}
		}
	}
`;

export const GET_USERS_IN_SAME_COMPANY = gql`
	query getUsersInSameCompany(
		$offset: Int!
		$limit: Int!
		$orderBy: [users_summary_view_order_by!]!
		$where: users_summary_view_bool_exp!
		$companyId: String!
	) {
		users_summary_view(
			offset: $offset
			limit: $limit
			order_by: $orderBy
			where: { _and: [{ company_id: { _eq: $companyId } }, $where] }
		) {
			user_id
			full_name
			first_name
			last_name
			mail
			last_access_at
			is_blocked
			blocked_at {
				date: max
			}
			unblocked_at {
				date: max
			}
			profile_id
			stamboek
			acc_created_at
			group_id
			group_name
			company_name
			is_exception
			business_category
			idps {
				idp
			}
			classifications {
				key
			}
			contexts {
				key
			}
			organisations {
				organization_id
				unit_id
				organization {
					ldap_description
				}
			}
			user {
				temp_access {
					until
					from
					current {
						status
					}
				}
			}
		}
		users_summary_view_aggregate(
			where: { _and: [{ company_id: { _eq: $companyId } }, $where] }
		) {
			aggregate {
				count
			}
		}
	}
`;

export const GET_USER_TEMP_ACCESS_BY_ID = gql`
	query getUserTempAccess($id: uuid!) {
		shared_users(where: { profile: { id: { _eq: $id }, is_deleted: { _eq: false } } }) {
			id
			uid
			full_name
			mail
			is_blocked
			temp_access {
				from
				until
				current {
					status
				}
			}
		}
	}
`;

export const UPDATE_USER_TEMP_ACCESS_BY_ID = gql`
	mutation addTempAccess($user_id: uuid!, $from: date, $until: date!) {
		insert_shared_user_temp_access_one(
			object: { user_id: $user_id, from: $from, until: $until }
			on_conflict: { constraint: user_temp_access_pkey, update_columns: [from, until] }
		) {
			user_id
			user {
				full_name
				mail
			}
			from
			until
		}
	}
`;

export const GET_PROFILE_IDS = gql`
	query getProfileIds($where: users_summary_view_bool_exp!) {
		users_summary_view(where: $where) {
			profile_id
		}
	}
`;

export const GET_PROFILE_NAMES = gql`
	query getProfileNames($profileIds: [uuid!]!) {
		users_summary_view(
			where: { profile_id: { _in: $profileIds }, is_deleted: { _eq: false } }
		) {
			profile_id
			full_name
			mail
		}
	}
`;

export const BULK_ADD_SUBJECTS_TO_PROFILES = gql`
	mutation bulkAddSubjectsToProfiles($subjects: [users_profile_classifications_insert_input!]!) {
		insert_users_profile_classifications(objects: $subjects) {
			affected_rows
		}
	}
`;

export const BULK_DELETE_SUBJECTS_FROM_PROFILES = gql`
	mutation bulkDeleteSubjectsFromProfiles($subjects: [String!]!, $profileIds: [uuid!]!) {
		delete_users_profile_classifications(
			where: { key: { _in: $subjects }, profile_id: { _in: $profileIds } }
		) {
			affected_rows
		}
	}
`;

export const GET_DISTINCT_BUSINESS_CATEGORIES = gql`
	query getDistinctBusinessCategories {
		users_profiles(
			distinct_on: business_category
			where: { business_category: { _is_null: false }, is_deleted: { _eq: false } }
		) {
			business_category
		}
	}
`;

export const GET_IDPS = gql`
	query getIdps {
		users_idps {
			value
		}
	}
`;

export const GET_CONTENT_COUNTS_FOR_USERS = gql`
	query getContentCountsForUsers($profileIds: [uuid!]!) {
		publicCollections: app_collections_aggregate(
			where: {
				profile: { id: { _in: $profileIds } }
				is_public: { _eq: true }
				is_deleted: { _eq: false }
			}
		) {
			aggregate {
				count
			}
		}
		publicContentPages: app_content_aggregate(
			where: {
				user_profile_id: { _in: $profileIds }
				is_public: { _eq: true }
				is_deleted: { _eq: false }
			}
		) {
			aggregate {
				count
			}
		}
		privateCollections: app_collections_aggregate(
			where: {
				profile: { id: { _in: $profileIds } }
				is_public: { _eq: false }
				is_deleted: { _eq: false }
			}
		) {
			aggregate {
				count
			}
		}
		assignments: app_assignments_aggregate(
			where: { owner_profile_id: { _in: $profileIds }, is_deleted: { _eq: false } }
		) {
			aggregate {
				count
			}
		}
		collectionBookmarks: app_collection_bookmarks_aggregate(
			where: { profile_id: { _in: $profileIds } }
		) {
			aggregate {
				count
			}
		}
		itemBookmarks: app_item_bookmarks_aggregate(where: { profile_id: { _in: $profileIds } }) {
			aggregate {
				count
			}
		}
		privateContentPages: app_content_aggregate(
			where: {
				user_profile_id: { _in: $profileIds }
				is_public: { _eq: false }
				is_deleted: { _eq: false }
			}
		) {
			aggregate {
				count
			}
		}
		quickLanes: app_quick_lanes_aggregate(where: { owner_profile_id: { _in: $profileIds } }) {
			aggregate {
				count
			}
		}
	}
`;
