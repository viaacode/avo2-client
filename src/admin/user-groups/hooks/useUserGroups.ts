import { useEffect, useState } from 'react';

import { UserGroupService } from '../user-group.service';
import { UserGroup } from '../user-group.types';

type UseUserGroupsTuple = [UserGroup[], boolean];

export const useUserGroups = (): UseUserGroupsTuple => {
	const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		UserGroupService.fetchAllUserGroups()
			.then(groups => {
				if (groups) {
					setUserGroups(groups);
				}
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	return [userGroups, isLoading];
};
