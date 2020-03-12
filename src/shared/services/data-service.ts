import ApolloClient from 'apollo-boost';
import { getEnv } from '../helpers';

export const dataService = new ApolloClient({
	uri: `${getEnv('PROXY_URL')}/data`,
	credentials: 'include',
});

type ApolloCache = { [key: string]: any };

export class ApolloCacheManager {
	public static clearBookmarksViewsPlays(cache: ApolloCache) {
		ApolloCacheManager.deleteFromCache(cache, 'app_item_bookmarks');
		ApolloCacheManager.deleteFromCache(cache, 'app_item_views');
		ApolloCacheManager.deleteFromCache(cache, 'app_item_plays');
	}
	/**
	 * Clear all collection aggregate related data from the cache
	 * eg: app_collections, app_collection_fragments, app_collections_aggregate
	 * @param cache
	 */
	public static clearCollectionCache(cache: ApolloCache) {
		ApolloCacheManager.deleteFromCache(cache, 'app_collection');
	}

	/**
	 * Clears all assignment related items from the cache
	 * eg: app_assignment, app_assignments_aggregate
	 * @param cache
	 */
	public static clearAssignmentCache(cache: ApolloCache) {
		ApolloCacheManager.deleteFromCache(cache, 'app_assignment');
	}

	/**
	 * Clears all nav elements related items from the cache
	 * eg: content_nav_elements
	 * @param cache
	 */
	public static clearNavElementsCache = (cache: ApolloCache) =>
		ApolloCacheManager.deleteFromCache(cache, 'app_content_nav_elements');

	/**
	 * Clears all content related items from the cache
	 * eg: content
	 * @param cache
	 */
	public static clearContentCache = (cache: ApolloCache) =>
		ApolloCacheManager.deleteFromCache(cache, 'app_content');

	/**
	 * Clears all content blocks related items from the cache
	 * eg: content
	 * @param cache
	 */
	public static clearContentBlocksCache = (cache: ApolloCache) =>
		ApolloCacheManager.deleteFromCache(cache, 'app_content_blocks');

	public static clearUserGroupCache = (cache: ApolloCache) =>
		ApolloCacheManager.deleteFromCache(cache, 'users_groups');

	public static clearInteractiveTourCache = (cache: ApolloCache) =>
		ApolloCacheManager.deleteFromCache(cache, 'app_interactive_tour');

	private static deleteFromCache(cache: ApolloCache, substring: string) {
		Object.keys(cache.data.data).forEach((key: string) => {
			// Also match keys starting with $ROOT_QUERY. for clearing aggregates cache
			if (key.match(new RegExp(substring, 'gi'))) {
				cache.data.delete(key);
			}
		});
		// Always delete the cache items that are stored under the miscellaneous label (ROOT_QUERY)
		cache.data.delete('ROOT_QUERY');
	}
}
