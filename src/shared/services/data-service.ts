import ApolloClient from 'apollo-boost';
import { getEnv } from '../helpers/env';

export const dataService = new ApolloClient({
	uri: `${getEnv('PROXY_URL')}/data`,
	credentials: 'include',
});

export class ApolloCacheManager {
	/**
	 * Clear all collection related data from the cache
	 * eg: app_collections, app_collection_fragments
	 * @param cache
	 */
	public static clearCollectionCache(cache: { [key: string]: any }) {
		ApolloCacheManager.deleteCacheFromCache(cache, 'app_collection');
	}

	/**
	 * Clears all assignment related items from the cache
	 * eg: app_assignment
	 * @param cache
	 */
	public static clearAssignmentCache = (cache: { [key: string]: any }) =>
		ApolloCacheManager.deleteCacheFromCache(cache, 'app_assignment');

	private static deleteCacheFromCache(cache: { [key: string]: any }, keyPrefix: string) {
		Object.keys(cache.data.data).forEach(
			(key: string) => key.match(new RegExp(`^${keyPrefix}`)) && cache.data.delete(key)
		);
	}
}
