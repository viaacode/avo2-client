import { gql } from 'apollo-boost';

export const GET_PUPIL_COLLECTIONS_ADMIN_OVERVIEW = gql`
	query getPupilCollectionsAdminOverview(
		$offset: Int!
		$limit: Int!
		$orderBy: [app_assignment_responses_v2_order_by!]!
		$where: app_assignment_responses_v2_bool_exp!
	) {
		app_assignment_responses_v2(
			offset: $offset
			limit: $limit
			order_by: $orderBy
			where: {
				_and: [
					$where
					{
						collection_title: { _is_null: false }
						assignment: { is_deleted: { _eq: false } }
					}
				]
			}
		) {
			id
			collection_title
			created_at
			updated_at
			owner {
				full_name
			}
			owner_profile_id
			assignment {
				title
				deadline_at
				owner {
					full_name
				}
				owner_profile_id
			}
		}
		app_assignment_responses_v2_aggregate(
			where: {
				_and: [
					$where
					{ collection_title: { _is_null: false } }
					{ assignment: { is_deleted: { _eq: false } } }
				]
			}
		) {
			aggregate {
				count
			}
		}
	}
`;

export const GET_PUPIL_COLLECTION_IDS = gql`
	query getPupilCollectionIds($where: app_assignment_responses_v2_bool_exp!) {
		app_assignment_responses_v2(
			where: {
				_and: [
					$where
					{ collection_title: { _is_null: false } }
					{ assignment: { is_deleted: { _eq: false } } }
				]
			}
		) {
			id
		}
	}
`;

export const BULK_UPDATE_AUTHOR_FOR_PUPIL_COLLECTIONS = gql`
	mutation bulkUpdateAuthorForPupilCollections(
		$authorId: uuid!
		$pupilCollectionIds: [uuid!]!
		$now: timestamptz!
	) {
		update_app_assignment_responses_v2(
			where: { id: { _in: $pupilCollectionIds } }
			_set: { owner_profile_id: $authorId, updated_at: $now }
		) {
			affected_rows
		}
	}
`;

export const DELETE_PUPIL_COLLECTIONS = gql`
	mutation deletePupilCollections($pupilCollectionIds: [uuid!]!) {
		update_app_assignment_responses_v2(
			_set: { collection_title: null }
			where: { id: { _in: $pupilCollectionIds } }
		) {
			affected_rows
		}
		delete_app_pupil_collection_blocks(
			where: { assignment_response_id: { _in: $pupilCollectionIds } }
		) {
			affected_rows
		}
	}
`;
