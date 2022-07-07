import { gql } from 'apollo-boost';

export const GET_ASSIGNMENT_BY_UUID = gql`
	query getAssignmentsById($id: uuid!) {
		app_assignments_v2(where: { id: { _eq: $id }, is_deleted: { _eq: false } }) {
			answer_url
			labels {
				assignment_label {
					color_enum_value
					color_override
					enum_color {
						label
						value
					}
					id
					label
					type
					owner_profile_id
				}
			}
			blocks(where: { is_deleted: { _eq: false } }, order_by: { position: asc }) {
				created_at
				custom_description
				custom_title
				end_oc
				fragment_id
				id
				is_deleted
				original_description
				original_title
				position
				start_oc
				thumbnail_path
				type
				updated_at
				use_custom_fields
			}
			responses {
				id
			}
			assignment_type
			available_at
			created_at
			deadline_at
			description
			id
			is_collaborative
			is_deleted
			title
			updated_at
			owner_profile_id
			owner {
				full_name
			}
		}
	}
`;

export const GET_ASSIGNMENT_BY_CONTENT_ID_AND_TYPE = gql`
	query getAssignmentsByContentIdAndType(
		$contentId: String!
		$contentType: lookup_enum_assignment_content_labels_enum!
	) {
		app_assignments(
			where: {
				content_id: { _eq: $contentId }
				content_label: { _eq: $contentType }
				is_deleted: { _eq: false }
			}
		) {
			uuid
			title
			profile {
				user: usersByuserId {
					id
					first_name
					last_name
				}
			}
			is_archived
		}
	}
`;

export const GET_ASSIGNMENTS_BY_OWNER_ID = gql`
	query getAssignmentsByOwner(
		$owner_profile_id: uuid
		$offset: Int = 0
		$limit: Int
		$order: [app_assignments_v2_order_by!]! = [{ deadline_at: desc }]
		$filter: [app_assignments_v2_bool_exp]
	) {
		app_assignments_v2(
			where: {
				owner_profile_id: { _eq: $owner_profile_id }
				is_deleted: { _eq: false }
				_and: $filter
			}
			offset: $offset
			limit: $limit
			order_by: $order
		) {
			id
			labels(order_by: { assignment_label: { label: asc } }) {
				assignment_label {
					color_enum_value
					color_override
					enum_color {
						label
						value
					}
					id
					label
					type
					owner_profile_id
				}
			}
			responses {
				id
			}
			assignment_type
			deadline_at
			is_deleted
			title
			owner_profile_id
			updated_at
			created_at
		}
		count: app_assignments_v2_aggregate(
			where: {
				owner_profile_id: { _eq: $owner_profile_id }
				is_deleted: { _eq: false }
				_and: $filter
			}
		) {
			aggregate {
				count
			}
		}
	}
`;

export const GET_ASSIGNMENTS_BY_RESPONSE_OWNER_ID = gql`
	query getAssignmentsByResponseOwnerId(
		$owner_profile_id: uuid!
		$offset: Int = 0
		$limit: Int
		$filter: [app_assignments_v2_bool_exp]
		$order: [app_assignments_v2_order_by!]!
	) {
		app_assignments_v2(
			where: {
				responses: { owner_profile_id: { _eq: $owner_profile_id } }
				is_deleted: { _eq: false }
				_and: $filter
			}
			limit: $limit
			offset: $offset
			order_by: $order
		) {
			id
			labels {
				assignment_label {
					color_enum_value
					color_override
					enum_color {
						label
						value
					}
					id
					label
					type
					owner_profile_id
				}
			}
			responses {
				id
			}
			assignment_type
			deadline_at
			is_deleted
			title
			created_at
			owner_profile_id
			profile {
				user: usersByuserId {
					first_name
					last_name
					id
				}
				avatar
				organisation {
					logo_url
					name
					or_id
				}
				id
			}
		}
		count: app_assignments_v2_aggregate(
			where: {
				responses: { owner_profile_id: { _eq: $owner_profile_id } }
				is_deleted: { _eq: false }
				_or: $filter
			}
		) {
			aggregate {
				count
			}
		}
	}
`;

export const GET_ASSIGNMENT_RESPONSES_BY_ASSIGNMENT_ID = gql`
	query getAssignmentResponsesByAssignmentId(
		$assignmentId: uuid!
		$offset: Int = 0
		$limit: Int
		$order: [app_assignment_responses_v2_order_by!]! = [{ updated_at: desc }]
		$filter: [app_assignment_responses_v2_bool_exp]
	) {
		app_assignment_responses_v2(
			where: { assignment_id: { _eq: $assignmentId }, _and: $filter }
			offset: $offset
			limit: $limit
			order_by: $order
		) {
			id
			collection_title
			updated_at
			pupil_collection_blocks_aggregate {
				aggregate {
					count
				}
			}
			owner {
				full_name
			}
		}
		count: app_assignment_responses_v2_aggregate(
			where: { assignment_id: { _eq: $assignmentId } }
		) {
			aggregate {
				count
			}
		}
	}
`;

export const GET_ASSIGNMENT_RESPONSES = gql`
	query getAssignmentResponses($profileId: uuid!, $assignmentId: uuid!) {
		app_assignment_responses_v2(
			where: { owner_profile_id: { _eq: $profileId }, assignment_id: { _eq: $assignmentId } }
		) {
			id
			created_at
			owner_profile_id
			assignment_id
			collection_title
			pupil_collection_blocks(where: { is_deleted: { _eq: false } }) {
				id
				fragment_id
				use_custom_fields
				custom_title
				custom_description
				start_oc
				end_oc
				position
				created_at
				updated_at
				type
				thumbnail_path
				assignment_response_id
			}
		}
	}
`;

export const GET_ASSIGNMENT_WITH_RESPONSE = gql`
	query getAssignmentWithResponse($assignmentId: uuid!, $pupilUuid: uuid!) {
		assignments: app_assignments_v2(
			where: { id: { _eq: $assignmentId }, is_deleted: { _eq: false } }
			order_by: [{ deadline_at: desc }]
		) {
			labels {
				id
				assignment_label {
					color_enum_value
					color_override
					enum_color {
						label
						value
					}
					id
					label
					type
					owner_profile_id
				}
			}
			responses(where: { owner_profile_id: { _eq: $pupilUuid } }) {
				id
				created_at
				owner_profile_id
				assignment_id
				collection_title
				pupil_collection_blocks(where: { is_deleted: { _eq: false } }) {
					id
					fragment_id
					use_custom_fields
					custom_title
					custom_description
					start_oc
					end_oc
					position
					created_at
					updated_at
					type
					thumbnail_path
					assignment_response_id
				}
			}
			assignment_type
			deadline_at
			id
			is_deleted
			title
			description
			created_at
			updated_at
			answer_url
			owner_profile_id
			profile {
				id
				organisation {
					logo_url
					name
					or_id
				}
				profile_user_group {
					group {
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
		}
	}
`;

export const GET_ASSIGNMENT_BLOCKS = gql`
	query getAssignmentBlocks($assignmentId: uuid!) {
		app_assignment_blocks_v2(
			where: { assignment_id: { _eq: $assignmentId }, is_deleted: { _eq: false } }
			order_by: { position: asc }
		) {
			id
			assignment_id
			fragment_id
			custom_title
			custom_description
			original_title
			original_description
			use_custom_fields
			start_oc
			end_oc
			type
			position
			thumbnail_path
			created_at
			updated_at
		}
	}
`;

export const INSERT_ASSIGNMENT = gql`
	mutation insertAssignment($assignment: app_assignments_v2_insert_input!) {
		insert_app_assignments_v2(objects: [$assignment]) {
			affected_rows
			returning {
				id
			}
		}
	}
`;

export const UPDATE_ASSIGNMENT = gql`
	mutation updateAssignmentById(
		$assignmentId: uuid!
		$assignment: app_assignments_v2_set_input!
	) {
		update_app_assignments_v2(where: { id: { _eq: $assignmentId } }, _set: $assignment) {
			affected_rows
		}
	}
`;

export const UPDATE_ASSIGNMENT_RESPONSE = gql`
	mutation updateAssignmentResponse(
		$assignmentResponseId: uuid
		$collectionTitle: String!
		$updatedAt: timestamptz!
	) {
		update_app_assignment_responses_v2(
			where: { id: { _eq: $assignmentResponseId } }
			_set: { collection_title: $collectionTitle, updated_at: $updatedAt }
		) {
			returning {
				assignment_id
				collection_title
				created_at
				id
				owner_profile_id
				pupil_collection_blocks(where: { is_deleted: { _eq: false } }) {
					assignment_response_id
					created_at
					custom_description
					custom_title
					end_oc
					fragment_id
					id
					position
					start_oc
					thumbnail_path
					type
					updated_at
					use_custom_fields
				}
			}
		}
	}
`;

export const UPDATE_ASSIGNMENT_RESPONSE_SUBMITTED_STATUS = gql`
	mutation toggleAssignmentResponseSubmitStatus($id: Int!, $submittedAt: timestamptz) {
		update_app_assignment_responses(
			where: { id: { _eq: $id } }
			_set: { submitted_at: $submittedAt }
		) {
			affected_rows
		}
	}
`;

export const DELETE_ASSIGNMENT = gql`
	mutation deleteAssignmentById($assignmentId: uuid!) {
		delete_app_assignments_v2(where: { id: { _eq: $assignmentId } }) {
			affected_rows
		}
	}
`;

export const DELETE_ASSIGNMENTS = gql`
	mutation deleteAssignmentsById($assignmentIds: [uuid!]!) {
		delete_app_assignments_v2(where: { id: { _in: $assignmentIds } }) {
			affected_rows
		}
	}
`;

export const DELETE_ASSIGNMENT_RESPONSE = gql`
	mutation deleteAssignmentResponseById($assignmentResponseId: uuid!) {
		delete_app_assignment_responses_v2(where: { id: { _eq: $assignmentResponseId } }) {
			affected_rows
		}
	}
`;

export const INSERT_ASSIGNMENT_RESPONSE = gql`
	mutation insertAssignmentResponse(
		$assignmentResponses: [app_assignment_responses_v2_insert_input!]!
	) {
		insert_app_assignment_responses_v2(objects: $assignmentResponses) {
			affected_rows
			returning {
				id
				created_at
				owner_profile_id
				assignment_id
				collection_title
			}
		}
	}
`;

export const INSERT_ASSIGNMENT_BLOCKS = gql`
	mutation insertAssignmentBlocks($assignmentBlocks: [app_assignment_blocks_v2_insert_input!]!) {
		insert_app_assignment_blocks_v2(objects: $assignmentBlocks) {
			affected_rows
		}
	}
`;

export const GET_MAX_POSITION_ASSIGNMENT_BLOCKS = gql`
	query getMaxPositionAssignmentBlocks($assignmentId: uuid!) {
		app_assignments_v2_by_pk(id: $assignmentId) {
			blocks_aggregate {
				aggregate {
					max {
						position
					}
				}
			}
		}
	}
`;

export const UPDATE_ASSIGNMENT_BLOCK = gql`
	mutation updateAssignmentBlock($blockId: uuid!, $update: app_assignment_blocks_v2_set_input!) {
		update_app_assignment_blocks_v2_by_pk(pk_columns: { id: $blockId }, _set: $update) {
			id
			assignment_id
			fragment_id
			custom_title
			custom_description
			original_title
			original_description
			use_custom_fields
			start_oc
			end_oc
			type
			position
			thumbnail_path
			created_at
			updated_at
		}
	}
`;

export const BULK_UPDATE_AUTHOR_FOR_ASSIGNMENTS = gql`
	mutation bulkUpdateAuthorForAssignments(
		$authorId: uuid!
		$assignmentIds: [uuid!]!
		$now: timestamptz!
	) {
		update_app_assignments_v2(
			where: { id: { _in: $assignmentIds }, is_deleted: { _eq: false } }
			_set: { owner_profile_id: $authorId, updated_at: $now }
		) {
			affected_rows
		}
	}
`;

export const GET_ASSIGNMENTS_ADMIN_OVERVIEW = gql`
	query getAssignmentsAdminOverview(
		$offset: Int!
		$limit: Int!
		$orderBy: [app_assignments_v2_order_by!]!
		$where: app_assignments_v2_bool_exp!
	) {
		app_assignments_v2(offset: $offset, limit: $limit, order_by: $orderBy, where: $where) {
			id
			title
			created_at
			updated_at
			deadline_at
			owner {
				full_name
				profile_id
			}
			responses_aggregate(where: { collection_title: { _is_null: false } }) {
				aggregate {
					count
				}
			}
		}
		app_assignments_v2_aggregate(where: $where) {
			aggregate {
				count
			}
		}
	}
`;

// TODO re-enable view-count after fix hasura
// view_count {
// 	count
// }

export const GET_ASSIGNMENT_IDS = gql`
	query getAssignmentIds($where: app_assignments_v2_bool_exp!) {
		app_assignments_v2(where: $where) {
			id
		}
	}
`;
