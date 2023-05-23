import { groupBy } from 'lodash-es';

import { ShareUserInfo, ShareUserInfoRights } from './ShareWithColleagues.types';

export const sortShareUsers = (users: ShareUserInfo[]): ShareUserInfo[] => {
	const groupedUsers: Partial<Record<ShareUserInfoRights, ShareUserInfo[]>> = groupBy(
		users,
		'rights'
	);
	console.log(groupedUsers);
	const test = [
		...(groupedUsers[ShareUserInfoRights.OWNER] || []),
		...(groupedUsers[ShareUserInfoRights.CONTRIBUTOR] || []),
		...(groupedUsers[ShareUserInfoRights.VIEWER] || []),
	];

	console.log(test);
	return test;
};

export const shareUserRightToString = (right: ShareUserInfoRights) => {
	return right.toLowerCase();
};

export const compareUsersEmail = (user: ShareUserInfo, toCompareUser: ShareUserInfo) => {
	console.log(user, toCompareUser);
	return user.email === toCompareUser.email;
};
