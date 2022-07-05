import { gql } from 'apollo-boost';

export const GET_MAX_POSITION_PUPIL_COLLECTION_BLOCKS = gql`
	query getMaxPositionPupilCollectionBlocks($assignmentResponseId: uuid!) {
		app_assignment_responses_v2_by_pk(id: $assignmentResponseId) {
			pupil_collection_blocks_aggregate {
				aggregate {
					max {
						position
					}
				}
			}
		}
	}
`;

export const INSERT_PUPIL_COLLECTION_BLOCKS = gql`
	mutation insertPupilCollectionBlocks(
		$pupilCollectionBlocks: [app_pupil_collection_blocks_insert_input!]!
	) {
		insert_app_pupil_collection_blocks(objects: $pupilCollectionBlocks) {
			affected_rows
		}
	}
`;
