import { flatten, groupBy, isEmpty, remove } from 'lodash';

import { ShareUserInfo, ShareUserInfoRights } from './ShareWithColleagues.types';

export const sortShareUsers = (users: ShareUserInfo[]) => {
	const groupedUsers = groupBy(users, 'rights');

	return flatten(
		remove(
			[groupedUsers.EIGENAAR, groupedUsers.BIJDRAGER, groupedUsers.KIJKER],
			(group) => !isEmpty(group)
		)
	);
};

export const shareUserRightToString = (right: ShareUserInfoRights) => {
	return (right as unknown as string).toLocaleLowerCase();
};
