import { gql } from 'apollo-boost';

export const GET_BUNDLES = gql`
	query fetchBundles($limit: Int!) {
		app_collections(order_by: { title: asc }, where: { type_id: { _eq: 4 } }, limit: $limit) {
			id
			title
		}
	}
`;

export const GET_BUNDLES_BY_TITLE = gql`
	query fetchBundles($title: String!, $limit: Int!) {
		app_collections(
			order_by: { title: asc }
			where: { type_id: { _eq: 4 }, title: { _ilike: $title } }
			limit: $limit
		) {
			id
			title
		}
	}
`;

// TODO replace with uuid once database has received correct migration
export const GET_COLLECTIONS_BY_IDS = gql`
	query getCollectionsByIds($ids: [uuid!]!) {
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
			avo1_id
		}
	}
`;

export const GET_COLLECTIONS_BY_AVO1_ID = gql`
	query getCollectionsByAvo1Id($avo1Id: String!) {
		items: app_collections(where: { avo1_id: { _eq: $avo1Id } }) {
			id
		}
	}
`;
