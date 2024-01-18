import { type Avo } from '@viaa/avo2-types';
import { get, noop } from 'lodash-es';

import {
	InsertCollectionBookmarkDocument,
	InsertItemBookmarkDocument,
} from '../generated/graphql-db-react-query';
import { CustomError } from '../helpers';

import { dataService } from './data-service';

const EVENT_QUERIES = {
	bookmark: {
		item: {
			query: InsertItemBookmarkDocument,
			variables: (contentId: string, profileId: string) => ({
				bookmarkItem: {
					item_id: contentId,
					profile_id: profileId,
				},
			}),
		},
		collection: {
			query: InsertCollectionBookmarkDocument,
			variables: (contentId: string, profileId: string) => ({
				bookmarkItem: {
					collection_id: contentId,
					profile_id: profileId,
				},
			}),
		},
	},
};

// TODO figure out why this is not used
export async function trackEvent(
	action: 'bookmark' | 'unbookmark' | 'view' | 'play',
	contentType: 'item' | 'collection' | 'bundle',
	contentId: string,
	user: Avo.User.User
): Promise<void> {
	try {
		const profileId = get(user, 'profile.id');
		if (!profileId) {
			throw new CustomError(
				'Failed to create bookmark because could not get profile id',
				null
			);
		}
		const query = get(EVENT_QUERIES, [action, contentType, 'query']);
		const variables = get(
			EVENT_QUERIES,
			[action, contentType, 'variables'],
			noop
		)(contentId, profileId);
		if (!query || !variables) {
			throw new CustomError(
				'Failed to find query/variables to execute query in the database',
				null
			);
		}
		await dataService.query({ query, variables });
	} catch (err) {
		console.error('Failed to track metric event to the database', err, {
			action,
			contentType,
			contentId,
			user,
		});
	}
}
