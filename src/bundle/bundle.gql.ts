import { gql } from 'apollo-boost';

export const GET_COLLECTIONS_BY_IDS = gql`
	query getCollectionsByIds($ids: [Int!]!) {
		items: app_collections(where: { id: { _in: $ids } }) {
			external_id
			id
			thumbnail_path
			updated_at
			organisation {
				logo_url
				name
			}
			title
		}
	}
`;
