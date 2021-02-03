import { gql } from 'apollo-boost';

export const GET_COLLECTIONS = gql`
	query getCollections(
		$where: app_collections_bool_exp!
		$orderBy: [app_collections_order_by!]!
		$offset: Int!
		$limit: Int!
	) {
		app_collections(where: $where, order_by: $orderBy, offset: $offset, limit: $limit) {
			id
			type_id
			updated_at
			title
			description
			is_public
			created_at
			owner_profile_id
			profile {
				id
				profile_user_group {
					group {
						label
						id
					}
				}
				user: usersByuserId {
					id
					full_name
				}
			}
			updated_by {
				id
				user: usersByuserId {
					id
					full_name
				}
			}
			collection_labels {
				id
				label
			}
			counts {
				bookmarks
				in_assignment
				in_collection
				views
				copies
			}
		}
		app_collections_aggregate(where: $where) {
			aggregate {
				count
			}
		}
	}
`;

// TODO add collection labels when they are added to the the views
// https://meemoo.atlassian.net/browse/DEV-1438
// collection_labels: labels {
// 	label
// 	id
// }
// TODO Add manager when his task is completed
// https://meemoo.atlassian.net/browse/DEV-1474
// mgmt_manager {
// 	id
// 	full_name
// 	mail
// }
export const GET_COLLECTION_ACTUALISATION = gql`
	query getCollectionActualisations(
		$where: app_collection_actualisation_overview_bool_exp!
		$orderBy: [app_collection_actualisation_overview_order_by!]!
		$offset: Int!
		$limit: Int!
	) {
		app_collections: app_collection_actualisation_overview(
			where: $where
			order_by: $orderBy
			offset: $offset
			limit: $limit
		) {
			id: collection_id
			created_at
			is_public
			subjects: lom_classification
			education_levels: lom_context
			mgmt_created_at
			mgmt_current_status
			mgmt_last_eindcheck_date
			mgmt_status_expires_at
			mgmt_updated_at
			owner_profile_id
			title
			type_id
			updated_at
			updated_by_profile_id
			owner {
				profile {
					id
					profile_user_group {
						group {
							label
							id
						}
					}
				}
				user_id
				full_name
			}
			last_editor {
				profile_id
				full_name
			}
		}
		app_collections_aggregate: app_collection_actualisation_overview_aggregate(where: $where) {
			aggregate {
				count
			}
		}
	}
`;

export const GET_COLLECTION_QUALITY_CHECK = gql`
	query getCollectionQualityCheck(
		$where: app_collection_qc_overview_bool_exp!
		$orderBy: [app_collection_qc_overview_order_by!]!
		$offset: Int!
		$limit: Int!
	) {
		app_collections: app_collection_qc_overview(
			where: $where
			order_by: $orderBy
			offset: $offset
			limit: $limit
		) {
			id: collection_id
			is_public
			subjects: lom_classification
			education_levels: lom_context
			owner {
				profile {
					id
					profile_user_group {
						group {
							label
							id
						}
					}
				}
				user_id
				full_name
			}
			created_at
			updated_at
			title
			updated_by_profile_id
			collection_labels: labels {
				id
				label
			}
			last_editor {
				full_name
			}
			mgmt_quality_check
			mgmt_language_check
			mgmt_eind_check_date
		}
		app_collections_aggregate: app_collection_qc_overview_aggregate(where: $where) {
			aggregate {
				count
			}
		}
	}
`;

export const GET_COLLECTION_MARCOM = gql`
	query getCollectionMarcom(
		$where: app_collection_marcom_overview_bool_exp!
		$orderBy: [app_collection_marcom_overview_order_by!]!
		$offset: Int!
		$limit: Int!
	) {
		app_collections: app_collection_marcom_overview(
			where: $where
			order_by: $orderBy
			offset: $offset
			limit: $limit
		) {
			channel_name
			channel_type
			id: collection_id
			created_at
			is_public
			klascement
			collection_labels: labels {
				label
				id
			}
			last_editor {
				full_name
			}
			subjects: lom_classification
			education_levels: lom_context
			owner {
				profile {
					id
					profile_user_group {
						group {
							label
							id
						}
					}
				}
				user_id
				full_name
			}
			last_marcom_date
			title
			updated_at
		}
		app_collections_aggregate: app_collection_marcom_overview_aggregate(where: $where) {
			aggregate {
				count
			}
		}
	}
`;

export const GET_COLLECTION_IDS = gql`
	query getCollectionsByIds($where: app_collections_bool_exp!) {
		app_collections(where: $where) {
			id
		}
	}
`;

export const BULK_UPDATE_PUBLISH_STATE_FOR_COLLECTIONS = gql`
	mutation bulkUpdatePublishSTateForCollections(
		$isPublic: Boolean!
		$collectionIds: [uuid!]!
		$now: timestamptz!
		$updatedByProfileId: uuid!
	) {
		update_app_collections(
			where: { id: { _in: $collectionIds }, is_deleted: { _eq: false } }
			_set: {
				is_public: $isPublic
				updated_at: $now
				updated_by_profile_id: $updatedByProfileId
			}
		) {
			affected_rows
		}
	}
`;

export const BULK_UPDATE_AUTHOR_FOR_COLLECTIONS = gql`
	mutation bulkUpdateAuthorForCollections(
		$authorId: uuid!
		$collectionIds: [uuid!]!
		$now: timestamptz!
		$updatedByProfileId: uuid!
	) {
		update_app_collections(
			where: { id: { _in: $collectionIds }, is_deleted: { _eq: false } }
			_set: {
				owner_profile_id: $authorId
				updated_at: $now
				updated_by_profile_id: $updatedByProfileId
			}
		) {
			affected_rows
		}
	}
`;

export const BULK_DELETE_COLLECTIONS = gql`
	mutation bulkDeleteCollections(
		$collectionIds: [uuid!]!
		$now: timestamptz!
		$updatedByProfileId: uuid!
	) {
		update_app_collections(
			where: { id: { _in: $collectionIds }, is_deleted: { _eq: false } }
			_set: { is_deleted: true, updated_at: $now, updated_by_profile_id: $updatedByProfileId }
		) {
			affected_rows
		}
	}
`;

export const BULK_ADD_LABELS_TO_COLLECTIONS = gql`
	mutation bulkAddLabelsToCollections($labels: [app_collection_labels_insert_input!]!) {
		insert_app_collection_labels(objects: $labels) {
			affected_rows
		}
	}
`;

export const BULK_DELETE_LABELS_FROM_COLLECTIONS = gql`
	mutation bulkDeleteLabelsFromCollections($labels: [String!]!, $collectionIds: [uuid!]!) {
		delete_app_collection_labels(
			where: { label: { _in: $labels }, collection_uuid: { _in: $collectionIds } }
		) {
			affected_rows
		}
	}
`;

export const BULK_UPDATE_DATE_AND_LAST_AUTHOR_COLLECTIONS = gql`
	mutation bulkUpdateDateAndLastAuthorCollections(
		$collectionIds: [uuid!]!
		$now: timestamptz!
		$updatedByProfileId: uuid!
	) {
		update_app_collections(
			where: { id: { _in: $collectionIds }, is_deleted: { _eq: false } }
			_set: { updated_at: $now, updated_by_profile_id: $updatedByProfileId }
		) {
			affected_rows
		}
	}
`;
