import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../helpers';
import { dataService } from './data-service';
import { INSERT_ITEM_BOOKMARK } from './event-service.gql';

const EVENT_QUERIES = {
	bookmark: {
		item: {
			query: INSERT_ITEM_BOOKMARK,
			variables: (contentId: string, profileId: string) => {
				item_id: id,
					profile_id: profileId,
			}
		}
	}
}

export async function trackEvent(
	action: 'bookmark' | 'unbookmark' | 'view' | 'play',
	contentType: 'item' | 'collection' | 'bundle',
	contentId: string,
	user: Avo.User.User
): Promise<void> {
	try {
		const profileId = get(user, 'profile.id');
		if (!profileId) {
			throw new CustomError('Failed to create bookmark because could not get profile id', null, {
				user,
			});
		}
		const response = await dataService.query({
			query: INSERT_ITEM_BOOKMARK,
			variables: {
				bookmarkItem: {
					item_id: id,
					profile_id: profileId,
				},
			},
		});

		if (response.errors) {
			throw new CustomError('Graphql errors', null, { errors: response.errors });
		}
	} catch (err) {
		console.error('Failed to track metric event to the database', err, { type, id });
	}
}
