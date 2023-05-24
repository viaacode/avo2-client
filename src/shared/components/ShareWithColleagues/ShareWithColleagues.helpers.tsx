import { groupBy } from 'lodash-es';

import { ShareUserInfo, ShareUserInfoRights } from './ShareWithColleagues.types';

export const sortShareUsers = (users: ShareUserInfo[]) => {
	const groupedUsers = groupBy(users, 'rights');

	return [
		...groupedUsers[ShareUserInfoRights.OWNER],
		...groupedUsers[ShareUserInfoRights.CONTRIBUTOR],
		...groupedUsers[ShareUserInfoRights.VIEWER],
	];
};

export const shareUserRightToString = (right: ShareUserInfoRights) => {
	return right.toLowerCase();
};
