import { gql } from 'apollo-boost';

export const GET_CONTENT_BLOCKS_BY_CONTENT_ID = gql`
	query getContentBlockByContentId($contentId: Int!) {
		app_content_blocks(where: { content_id: { _eq: $contentId } }) {
			id
			content_block_type
			content_id
			position
			variables
		}
	}
`;
