import ApolloClient from 'apollo-boost';
import { getEnv } from '../helpers/env';

export const dataService = new ApolloClient({
	uri: `${getEnv('PROXY_URL')}/data`,
	credentials: 'include',
});

export class ApolloCacheManager {
	/**
	 * Clear all collection aggregate related data from the cache
	 * eg: app_collections, app_collection_fragments, app_collections_aggregate
	 * @param cache
	 */
	public static clearCollectionCache(cache: { [key: string]: any }) {
		ApolloCacheManager.deleteFromCache(cache, 'app_collection');
	}

	/**
	 * Clears all assignment related items from the cache
	 * eg: app_assignment, app_assignments_aggregate
	 * @param cache
	 */
	public static clearAssignmentCache(cache: { [key: string]: any }) {
		ApolloCacheManager.deleteFromCache(cache, 'app_assignment');
	}

	/**
	 * Clears all nav elements related items from the cache
	 * eg: content_nav_elements
	 * @param cache
	 */
	public static clearNavElementsCache = (cache: { [key: string]: any }) =>
		ApolloCacheManager.deleteFromCache(cache, 'app_content_nav_elements');

	private static deleteFromCache(cache: { [key: string]: any }, keyPrefix: string) {
		Object.keys(cache.data.data).forEach((key: string) => {
			if (key.match(new RegExp(`^\\$root_query\\.${keyPrefix}|^${keyPrefix}`, 'gmi'))) {
				cache.data.delete(key);
			}
		});
	}
}
