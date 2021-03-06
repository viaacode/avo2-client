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
			classifications {
				id
				key
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
			}
		}
		users_summary_view_aggregate(where: $where) {
			aggregate {
				count
			}
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

// TODO add is_deleted = false when this becomes available in the database view
export const GET_PROFILE_NAMES = gql`
	query getProfileNames($profileIds: [uuid!]!) {
		users_summary_view(where: { profile_id: { _in: $profileIds } }) {
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
	}
`;
