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
			is_deleted
			created_at
			owner_profile_id
			profile {
				id
				organisation {
					logo_url
					name
					or_id
				}
				profile_user_groups {
					groups {
						label
						id
					}
				}
				user: usersByuserId {
					id
					first_name
					last_name
				}
			}
			lom_context
			lom_classification
			updated_by {
				id
				user: usersByuserId {
					id
					first_name
					last_name
					profile {
						profile_user_groups {
							groups {
								label
								id
							}
						}
					}
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
			}
			relations_aggregate(where: { predicate: { _eq: "HAS_COPY" } }) {
				aggregate {
					count
				}
			}
		}
		app_collections_aggregate(where: $where) {
			aggregate {
				count
			}
		}
	}
`;

export const BULK_UPDATE_PUBLISH_STATE_FOR_COLLECTIONS = gql`
	mutation bulkUpdatePublishSTateForCollections($isPublic: Boolean!, $collectionIds: [uuid!]!) {
		update_app_collections(
			where: { id: { _in: $collectionIds } }
			_set: { is_public: $isPublic }
		) {
			affected_rows
		}
	}
`;

export const BULK_UPDATE_AUTHOR_FOR_COLLECTIONS = gql`
	mutation bulkUpdateAuthorForCollections($authorId: uuid!, $collectionIds: [uuid!]!) {
		update_app_collections(
			where: { id: { _in: $collectionIds } }
			_set: { author_uid: $authorId }
		) {
			affected_rows
		}
	}
`;

export const BULK_DELETE_COLLECTIONS = gql`
	mutation bulkDeleteCollections($collectionIds: [uuid!]!) {
		update_app_collections(where: { id: { _in: $collectionIds } }, _set: { is_deleted: true }) {
			affected_rows
		}
	}
`;
