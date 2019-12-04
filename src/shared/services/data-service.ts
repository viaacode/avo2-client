import ApolloClient from 'apollo-boost';
import { getEnv } from '../helpers/env';

export const dataService = new ApolloClient({
	uri: `${getEnv('PROXY_URL')}/data`,
	credentials: 'include',
});

type ApolloCache = { [key: string]: any };

export class ApolloCacheManager {
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

	private static deleteFromCache(cache: ApolloCache, keyPrefix: string) {
		Object.keys(cache.data.data).forEach((key: string) => {
			// Also match keys starting with $ROOT_QUERY. for clearing aggregates cache
			if (key.match(new RegExp(`^\\$root_query\\.${keyPrefix}|^${keyPrefix}`, 'gmi'))) {
				cache.data.delete(key);
			}
		});
	}
}
