import { gql } from 'apollo-boost';

export const GET_CLASSIFICATIONS_AND_SUBJECTS = gql`
	{
		lookup_enum_lom_context {
			description
		}
		lookup_enum_lom_classification {
			description
		}
	}
`;
