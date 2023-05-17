import { flatten, groupBy } from 'lodash';

import { ShareUserInfo, ShareUserInfoRights } from './ShareWithColleagues.types';

export const sortShareUsers = (users: ShareUserInfo[]) => {
	const groupedUsers = groupBy(users, 'rights');
	return flatten([groupedUsers.EIGENAAR, groupedUsers.BIJDRAGER, groupedUsers.KIJKER]);
};

export const shareUserRightToString = (right: ShareUserInfoRights) => {
	return (right as unknown as string).toLocaleLowerCase();
};
