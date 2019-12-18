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

export const INSERT_CONTENT_BLOCKS = gql`
	mutation insertContentBlocks($contentBlocks: [app_content_blocks_insert_input!]!) {
		affected_rows
	}
`;

export const UPDATE_CONTENT_BLOCK = gql`
	mutation updateContentBlock($id: Int!, $contentBlock: app_content_blocks_set_input!) {
		update_app_content_blocks(where: { id: { _eq: $id } }, _set: $contentBlock) {
			affected_rows
		}
	}
`;

export const DELETE_CONTENT_BLOCK = gql`
	mutation deleteContentBlock($id: Int!) {
		delete_app_content_blocks(where: { id: { _eq: $id } }) {
			affected_rows
		}
	}
`;
