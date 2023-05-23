import { groupBy } from 'lodash-es';

import { ShareUserInfo, ShareUserInfoRights } from './ShareWithColleagues.types';

export const sortShareUsers = (users: ShareUserInfo[]): ShareUserInfo[] => {
	const groupedUsers: Partial<Record<ShareUserInfoRights, ShareUserInfo[]>> = groupBy(
		users,
		'rights'
	);

	return [
		...(groupedUsers[ShareUserInfoRights.OWNER] || []),
		...(groupedUsers[ShareUserInfoRights.CONTRIBUTOR] || []),
		...(groupedUsers[ShareUserInfoRights.VIEWER] || []),
	];
};

export const shareUserRightToString = (right: ShareUserInfoRights) => {
	return right.toLowerCase();
};

export const compareUsersEmail = (user: ShareUserInfo, toCompareUser: ShareUserInfo) => {
	return user.email === toCompareUser.email;
};
