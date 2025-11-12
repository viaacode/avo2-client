import { sortBy } from 'es-toolkit';
import { useEffect, useState } from 'react';

import { GET_SPECIAL_USER_GROUPS } from '../user-group.const.js';
import { UserGroupService } from '../user-group.service.js';
import { type UserGroup } from '../user-group.types.js';

type UseUserGroupsTuple = [Partial<UserGroup>[], boolean];

export const useUserGroups = (includeSpecialGroups: boolean): UseUserGroupsTuple => {
	const [userGroups, setUserGroups] = useState<Partial<UserGroup>[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		UserGroupService.fetchAllUserGroups()
			.then(async (groups) => {
				if (groups) {
					const { preferredUserGroupOrder } = await import('@meemoo/admin-core-ui/admin');
					setUserGroups([
						...(includeSpecialGroups ? GET_SPECIAL_USER_GROUPS() : []),
						...sortBy(
							groups,
							(userGroup) => preferredUserGroupOrder[userGroup.label || '']
						),
					]);
				}
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [includeSpecialGroups]);

	return [userGroups, isLoading];
};
