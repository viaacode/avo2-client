import { gql } from 'apollo-boost';

export const GET_ASSIGNMENT_LABELS = gql`
	query getAssignmentLabels {
		app_assignment_labels {
			color_enum_value
			color_override
			label
		}
	}
`;
