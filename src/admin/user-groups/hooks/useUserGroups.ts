import { sortBy } from 'lodash-es';
import { useEffect, useState } from 'react';

import { GET_SPECIAL_USER_GROUPS } from '../user-group.const';
import { UserGroupService } from '../user-group.service';
import { type UserGroup } from '../user-group.types';

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
