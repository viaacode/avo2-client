import { DocumentNode } from 'graphql/language/ast';
import { print } from 'graphql/language/printer';
import { isString } from 'lodash-es';

import { getEnv } from '../helpers';
import { goToLoginBecauseOfUnauthorizedError } from '../helpers/fetch-with-logout';

// Use by graphql codegen in codegen.yml to fetch info from the dataservice and wrap those requests in react-query hooks
export const fetchData = <TData, TVariables>(
	query: string | any,
	variables?: TVariables,
	options?: RequestInit['headers']
): (() => Promise<TData>) => {
	return async () => {
		const res = await fetch(`${getEnv('PROXY_URL')}/data`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...options,
			},
			body: JSON.stringify({
				query: isString(query) ? query : print(query),
				variables,
			}),
		});

		if (res.status === 401) {
			goToLoginBecauseOfUnauthorizedError();
			return;
		}

		const json = await res.json();

		if (json.errors) {
			const { message } = json.errors[0] || {};
			throw new Error(message || 'Error');
		}

		return json.data;
	};
};

export interface QueryInfo {
	query: string | DocumentNode;
	variables?: Record<string, any>;
	update?: (cache: ApolloCache) => void;
}

export class dataService {
	public static async query<T>(queryInfo: QueryInfo): Promise<T> {
		return (await fetchData(queryInfo.query, queryInfo.variables)()) as T;
	}
}

export const NO_RIGHTS_ERROR_MESSAGE = 'You are not allowed to run this query';

export const COLLECTION_QUERY_KEYS = ['getCollectionsByOwner']; // TODO, use this mechanism from react-query to clear cache instead of the apolloCacheManager

type ApolloCache = { [key: string]: any };

/**
 * @deprecated use react-query caching instead
 */
export class ApolloCacheManager {
	public static clearBookmarksViewsPlays(cache: ApolloCache): void {
		ApolloCacheManager.deleteFromCache(cache, 'app_item_bookmarks');
		ApolloCacheManager.deleteFromCache(cache, 'app_item_views');
		ApolloCacheManager.deleteFromCache(cache, 'app_item_plays');
		ApolloCacheManager.deleteFromCache(cache, 'app_collection_bookmarks');
		ApolloCacheManager.deleteFromCache(cache, 'app_collection_views');
		ApolloCacheManager.deleteFromCache(cache, 'app_collection_plays');
	}

	public static clearItemCache(cache: ApolloCache): void {
		ApolloCacheManager.deleteFromCache(cache, 'app_item_meta');
	}

	public static clearSharedItemsCache(cache: ApolloCache): void {
		ApolloCacheManager.deleteFromCache(cache, 'shared_items');
	}

	/**
	 * Clear all collection aggregate related data from the cache
	 * eg: app_collections, app_collection_fragments, app_collections_aggregate
	 * @param cache
	 */
	public static clearCollectionCache(cache: ApolloCache): void {
		ApolloCacheManager.deleteFromCache(cache, 'app_collection');
	}

	/**
	 * Clears all assignment related items from the cache
	 * eg: app_assignment, app_assignments_aggregate
	 * @param cache
	 */
	public static clearAssignmentCache(cache: ApolloCache): void {
		ApolloCacheManager.deleteFromCache(cache, 'app_assignment');
		ApolloCacheManager.deleteFromCache(cache, 'app_assignment_blocks_v2');
		ApolloCacheManager.deleteFromCache(cache, 'app_assignment_responses_v2');
		ApolloCacheManager.deleteFromCache(cache, 'app_pupil_collection_blocks');
	}

	public static clearQuickLaneCache(cache: ApolloCache): void {
		ApolloCacheManager.deleteFromCache(cache, 'app_quick_lanes');
		ApolloCacheManager.deleteFromCache(cache, 'app_quick_lanes_aggregate');
	}

	/**
	 * Clears all nav elements related items from the cache
	 * eg: content_nav_elements
	 * @param cache
	 */
	public static clearNavElementsCache = (cache: ApolloCache): void =>
		ApolloCacheManager.deleteFromCache(cache, 'app_content_nav_elements');

	/**
	 * Clears all content related items from the cache
	 * eg: content
	 * @param cache
	 */
	public static clearContentCache = (cache: ApolloCache): void =>
		ApolloCacheManager.deleteFromCache(cache, 'app_content');

	public static clearPermissionCache = (cache: ApolloCache): void =>
		ApolloCacheManager.deleteFromCache(cache, 'users_permission');

	public static clearNotificationCache = (cache: ApolloCache): void =>
		ApolloCacheManager.deleteFromCache(cache, 'users_notifications');

	/**
	 * Clears all content blocks related items from the cache
	 * eg: content
	 * @param cache
	 */
	public static clearContentBlocksCache = (cache: ApolloCache): void =>
		ApolloCacheManager.deleteFromCache(cache, 'app_content_blocks');

	public static clearUserGroupCache = (cache: ApolloCache): void =>
		ApolloCacheManager.deleteFromCache(cache, 'users_groups');

	public static clearContentLabels = (cache: ApolloCache): void =>
		ApolloCacheManager.deleteFromCache(cache, 'app_content_labels');

	public static clearInteractiveTourCache = (cache: ApolloCache): void =>
		ApolloCacheManager.deleteFromCache(cache, 'app_interactive_tour');

	public static clearUserCache = (cache: ApolloCache): void => {
		ApolloCacheManager.deleteFromCache(cache, 'shared_users');
		ApolloCacheManager.deleteFromCache(cache, 'users_profile');
	};

	public static clearTranslations = (cache: ApolloCache): void =>
		ApolloCacheManager.deleteFromCache(cache, 'app_site_variables');

	private static deleteFromCache(cache: ApolloCache, substring: string) {
		Object.keys(cache.data.data).forEach((key: string) => {
			// Also match keys starting with $ROOT_QUERY. for clearing aggregates cache
			if (
				key.match(new RegExp(substring, 'gi')) ||
				key.match(new RegExp('ROOT_QUERY', 'gi'))
			) {
				cache.data.delete(key);
			}
		});
	}
}
