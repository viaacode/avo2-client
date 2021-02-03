import { gql } from 'apollo-boost';

export const UPDATE_COLLECTION = gql`
	mutation updateCollectionById($id: uuid!, $collection: app_collections_set_input!) {
		update_app_collections(
			where: { id: { _eq: $id }, is_deleted: { _eq: false } }
			_set: $collection
		) {
			affected_rows
		}
	}
`;

export const INSERT_COLLECTION = gql`
	mutation insertCollection($collection: app_collections_insert_input!) {
		insert_app_collections(objects: [$collection]) {
			affected_rows
			returning {
				id
				title
				collection_fragments(order_by: { position: asc }) {
					id
				}
			}
		}
	}
`;

export const SOFT_DELETE_COLLECTION = gql`
	mutation softDeleteCollectionById($id: uuid!) {
		update_app_collections(where: { id: { _eq: $id } }, _set: { is_deleted: true }) {
			affected_rows
		}
	}
`;

export const UPDATE_COLLECTION_FRAGMENT = gql`
	mutation updateCollectionFragmentById(
		$id: Int!
		$fragment: app_collection_fragments_set_input!
	) {
		update_app_collection_fragments(where: { id: { _eq: $id } }, _set: $fragment) {
			affected_rows
		}
	}
`;

export const DELETE_COLLECTION_FRAGMENT = gql`
	mutation deleteCollectionFragmentById($id: Int!) {
		delete_app_collection_fragments(where: { id: { _eq: $id } }) {
			affected_rows
		}
	}
`;

export const INSERT_COLLECTION_FRAGMENTS = gql`
	mutation insertCollectionFragment(
		$id: Int!
		$fragments: [app_collection_fragments_insert_input!]!
	) {
		insert_app_collection_fragments(objects: $fragments) {
			affected_rows
			returning {
				id
			}
		}
	}
`;

export const GET_COLLECTIONS_BY_OWNER = gql`
	query getCollectionsByOwner(
		$owner_profile_id: uuid
		$type_id: Int
		$offset: Int = 0
		$limit: Int
		$order: [app_collections_order_by!] = { updated_at: desc }
	) {
		app_collections(
			where: {
				type_id: { _eq: $type_id }
				owner_profile_id: { _eq: $owner_profile_id }
				is_deleted: { _eq: false }
			}
			offset: $offset
			limit: $limit
			order_by: $order
		) {
			id
			updated_at
			type_id
			type {
				label
				id
			}
			title
			publish_at
			owner_profile_id
			profile {
				id
				alias
				title
				alternative_email
				avatar
				organisation {
					logo_url
					name
					or_id
				}
				created_at
				stamboek
				updated_at
				user_id
				user: usersByuserId {
					id
					first_name
					last_name
					profile {
						profile_user_group {
							group {
								label
								id
							}
						}
					}
				}
			}
			is_public
			external_id
			depublish_at
			created_at
			thumbnail_path
			view_counts_aggregate {
				aggregate {
					sum {
						count
					}
				}
			}
		}
	}
`;

export const GET_PUBLIC_COLLECTIONS = gql`
	query getPublicCollections($limit: Int!, $typeId: Int!) {
		app_collections(
			order_by: { title: asc }
			where: {
				type_id: { _eq: $typeId }
				is_public: { _eq: true }
				is_deleted: { _eq: false }
			}
			limit: $limit
		) {
			id
			title
		}
	}
`;

export const GET_PUBLIC_COLLECTIONS_BY_ID = gql`
	query getPublicCollectionsById($id: uuid!, $typeId: Int!, $limit: Int!) {
		app_collections(
			order_by: { title: asc }
			where: {
				type_id: { _eq: $typeId }
				id: { _eq: $id }
				is_public: { _eq: true }
				is_deleted: { _eq: false }
			}
			limit: $limit
		) {
			id
			title
		}
	}
`;

export const GET_PUBLIC_COLLECTIONS_BY_TITLE = gql`
	query getPublicCollectionsByTitle($title: String!, $typeId: Int!, $limit: Int!) {
		app_collections(
			order_by: { title: asc }
			where: {
				type_id: { _eq: $typeId }
				title: { _ilike: $title }
				is_public: { _eq: true }
				is_deleted: { _eq: false }
			}
			limit: $limit
		) {
			id
			title
		}
	}
`;

export const GET_COLLECTION_TITLES_BY_OWNER = gql`
	query getCollectionNamesByOwner($owner_profile_id: uuid) {
		app_collections(
			where: {
				type_id: { _eq: 3 }
				owner_profile_id: { _eq: $owner_profile_id }
				is_deleted: { _eq: false }
			}
			order_by: { updated_at: desc }
		) {
			id
			title
		}
	}
`;

export const GET_BUNDLE_TITLES_BY_OWNER = gql`
	query getCollectionNamesByOwner($owner_profile_id: uuid) {
		app_collections(
			where: {
				type_id: { _eq: 4 }
				owner_profile_id: { _eq: $owner_profile_id }
				is_deleted: { _eq: false }
			}
			order_by: { updated_at: desc }
		) {
			id
			title
		}
	}
`;

export const GET_BUNDLES_CONTAINING_COLLECTION = gql`
	query getPublishedBundlesContainingCollection($id: String!) {
		app_collections(
			where: {
				is_public: { _eq: true }
				collection_fragments: { external_id: { _eq: $id } }
				is_deleted: { _eq: false }
			}
		) {
			id
			title
		}
	}
`;

export const INSERT_COLLECTION_LABELS = gql`
	mutation insertCollectionLabels($objects: [app_collection_labels_insert_input!]!) {
		insert_app_collection_labels(objects: $objects) {
			affected_rows
		}
	}
`;

export const DELETE_COLLECTION_LABELS = gql`
	mutation deleteCollectionLabels($labels: [String!]!, $collectionId: uuid!) {
		delete_app_collection_labels(
			where: { label: { _in: $labels }, collection_uuid: { _eq: $collectionId } }
		) {
			affected_rows
		}
	}
`;

export const GET_QUALITY_LABELS = gql`
	query getQualityLabels {
		lookup_enum_collection_labels {
			description
			value
		}
	}
`;

export const GET_COLLECTION_BY_TITLE_OR_DESCRIPTION = gql`
	query getCollectionByTitleOrDescription(
		$title: String!
		$description: String!
		$collectionId: uuid!
		$typeId: Int
	) {
		collectionByTitle: app_collections(
			where: {
				title: { _eq: $title }
				is_deleted: { _eq: false }
				is_public: { _eq: true }
				id: { _neq: $collectionId }
				type_id: { _eq: $typeId }
			}
			limit: 1
		) {
			id
		}
		collectionByDescription: app_collections(
			where: {
				description: { _eq: $description }
				is_deleted: { _eq: false }
				is_public: { _eq: true }
				id: { _neq: $collectionId }
				type_id: { _eq: $typeId }
			}
			limit: 1
		) {
			id
		}
	}
`;

export const GET_COLLECTIONS_BY_FRAGMENT_ID = gql`
	query getCollectionsByItemUuid($fragmentId: String!) {
		app_collections(
			where: {
				collection_fragments: { external_id: { _eq: $fragmentId } }
				is_deleted: { _eq: false }
			}
		) {
			id
			title
			is_public
			profile {
				user: usersByuserId {
					first_name
					last_name
					id
				}
				id
				organisation {
					name
				}
			}
		}
	}
`;

export const INSERT_COLLECTION_MANAGEMENT_ENTRY = gql`
	mutation insertCollectionManagementEntry(
		$collection_id: uuid!
		$current_status: String
		$manager_profile_id: uuid
		$status_valid_until: timestamptz
		$note: String
	) {
		insert_app_collection_management(
			objects: [
				{
					collection_id: $collection_id
					current_status: $current_status
					manager_profile_id: $manager_profile_id
					status_valid_until: $status_valid_until
					note: $note
				}
			]
		) {
			affected_rows
		}
	}
`;

export const UPDATE_COLLECTION_MANAGEMENT_ENTRY = gql`
	mutation updateCollectionManagementEntry(
		$collection_id: uuid!
		$current_status: String
		$manager_profile_id: uuid
		$status_valid_until: timestamptz
		$note: String
	) {
		update_app_collection_management(
			where: { collection_id: { _eq: $collection_id } }
			_set: {
				current_status: $current_status
				manager_profile_id: $manager_profile_id
				status_valid_until: $status_valid_until
				note: $note
			}
		) {
			affected_rows
		}
	}
`;

export const INSERT_COLLECTION_MANAGEMENT_QC_ENTRY = gql`
	mutation insertCollectionManagementEntry(
		$collection_id: uuid!
		$comment: String
		$assignee_profile_id: uuid
		$qc_label: lookup_enum_collection_management_qc_label_enum
		$qc_status: Boolean
	) {
		insert_app_collection_management_QC_one(
			object: {
				comment: $comment
				assignee_profile_id: $assignee_profile_id
				qc_label: $qc_label
				qc_status: $qc_status
				collection_id: $collection_id
			}
		) {
			id
		}
	}
`;

export const GET_MARCOM_ENTRIES = gql`
	query getCollectionMarcomEntries($collectionUuid: uuid!) {
		app_collection_marcom_log(
			where: { collection_id: { _eq: $collectionUuid } }
			limit: 10
			order_by: [{ created_at: desc_nulls_last }]
		) {
			id
			channel_name
			channel_type
			external_link
			publish_date
		}
	}
`;

export const INSERT_MARCOM_ENTRY = gql`
	mutation insertMarcomEntry($objects: [app_collection_marcom_log_insert_input!]!) {
		insert_app_collection_marcom_log(objects: $objects) {
			affected_rows
		}
	}
`;
