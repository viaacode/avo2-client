import { fetchWithLogoutJson } from '@meemoo/admin-core-ui';
import { IconName } from '@viaa/avo2-components';
import { memoize } from 'lodash-es';

import { CustomError, getEnv } from '../helpers';

export interface AppContentNavElement {
	content_path: string | null;
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
	tooltip: string;
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
		return fetchWithLogoutJson<NavItemMap>(`${getEnv('PROXY_URL')}/navigation/items`);
	} catch (err) {
		throw new CustomError('Failed to get all user groups', err);
	}
}

export const getNavigationItems: () => Promise<NavItemMap> = memoize(getNavItems);
