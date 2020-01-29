import { memoize } from 'lodash-es';

import { IconName } from '@viaa/avo2-components';
import { getEnv } from '../helpers';
import { CustomError } from '../helpers/error';

export interface AppContentNavElement {
	content_path: any;
	content_type: any;
	link_target: string;
	placement: string;
	position: number;
	id: number;
	icon_name: IconName;
	user_group_ids: number[];
	label: string;
	updated_at: string;
	description: string;
	created_at: string;
	content_id: any;
}

export type NavItemMap = { [navBarName: string]: AppContentNavElement[] };

/**
 * Gets navigation items that the current user can see
 * AppContentNavElement.user_group_ids can contain any userGroup ids and also -1, -2
 *    -1 is a special group: logged out users
 *    -2 is a special group: logged in users
 *        since you can have a user that isn't a member of any userGroups
 */
async function getNavItems(): Promise<NavItemMap> {
	try {
		const response = await fetch(`${getEnv('PROXY_URL')}/navigation-items`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		});
		if (response.status < 200 && response.status >= 400) {
			throw new CustomError('Failed to get navigation items from server', null, { response });
		}
		return await response.json();
	} catch (err) {
		throw new CustomError('Failed to get all user groups', err);
	}
}

export const getNavigationItems: () => Promise<NavItemMap> = memoize(getNavItems);
