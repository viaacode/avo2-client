import { gql } from 'apollo-boost';

export const GET_ASSIGNMENT_LABELS_BY_PROFILE_ID = gql`
	query getAssignmentLabels($profileId: uuid!) {
		app_assignment_labels(
			where: { owner_profile_id: { _eq: $profileId } }
			order_by: { label: asc }
		) {
			color_enum_value
			color_override
			label
			id
			enum_color {
				label
				value
			}
		}
	}
`;

export const INSERT_ASSIGNMENT_LABELS = gql`
	mutation insertAssignmentLabels($objects: [app_assignment_labels_insert_input!]!) {
		insert_app_assignment_labels(objects: $objects) {
			returning {
				id
			}
		}
	}
`;

export const UPDATE_ASSIGNMENT_LABEL = gql`
	mutation updateAssignmentLabels(
		$label: String!
		$colorEnumValue: lookup_enum_colors_enum!
		$profileId: uuid!
		$labelId: Int!
	) {
		update_app_assignment_labels(
			_set: { label: $label, color_enum_value: $colorEnumValue }
			where: { owner_profile_id: { _eq: $profileId }, id: { _eq: $labelId } }
		) {
			affected_rows
		}
	}
`;

export const DELETE_ASSIGNMENT_LABELS = gql`
	mutation deleteAssignmentLabel($profileId: uuid!, $labelIds: [Int!]!) {
		delete_app_assignment_labels(
			where: { owner_profile_id: { _eq: $profileId }, id: { _in: $labelIds } }
		) {
			affected_rows
		}
		delete_app_assignment_assignment_tags(where: { assignment_tag_id: { _in: $labelIds } }) {
			affected_rows
		}
	}
`;

export const LINK_ASSIGNMENT_LABELS_FROM_ASSIGNMENT = gql`
	mutation linkAssignmentLabelsToAssignment(
		$objects: [app_assignment_assignment_tags_insert_input!]!
	) {
		insert_app_assignment_assignment_tags(objects: $objects) {
			affected_rows
		}
	}
`;

export const UNLINK_ASSIGNMENT_LABELS_FROM_ASSIGNMENT = gql`
	mutation unlinkAssignmentLabelsFromAssignment($assignmentId: Int!, $labelIds: [Int!]!) {
		delete_app_assignment_assignment_tags(
			where: { assignment_id: { _eq: $assignmentId }, assignment_tag_id: { _in: $labelIds } }
		) {
			affected_rows
		}
	}
`;

export const GET_ALL_ASSIGNMENT_LABEL_COLORS = gql`
	query getAllAssignmentLabelColors {
		lookup_enum_colors {
			label
			value
		}
	}
`;
