import { gql } from 'apollo-boost';

export const INSERT_ITEM_BOOKMARK = gql`
	mutation insertItemBookmark($bookmarkItem: app_item_bookmarks_insert_input!) {
		insert_app_item_bookmarks {
			affected_rows
		}
	}
`;

// export const INSERT_ITEM_VIEW = gql`
// 	mutation insertItemView($viewItem: app_item_views_insert_input!) {
// 		insert_app_item_views {
// 			affected_rows
// 		}
// 	}
// `;
//
// export const INSERT_ITEM_PLAY = gql`
// 	mutation insertItemPlay($playItem: app_item_plays_insert_input!) {
// 		insert_app_item_plays {
// 			affected_rows
// 		}
// 	}
// `;

export const INSERT_COLLECTION_BOOKMARK = gql`
	mutation insertCollectionBookmark($bookmarkItem: app_collection_bookmarks_insert_input!) {
		insert_app_collection_bookmarks {
			affected_rows
		}
	}
`;

// export const INSERT_COLLECTION_VIEW = gql`
// 	mutation insertCollectionView($viewItem: app_collection_views_insert_input!) {
// 		insert_app_collection_views {
// 			affected_rows
// 		}
// 	}
// `;
//
// export const INSERT_COLLECTION_PLAY = gql`
// 	mutation insertCollectionPlay($playItem: app_collection_plays_insert_input!) {
// 		insert_app_collection_plays {
// 			affected_rows
// 		}
// 	}
// `;
