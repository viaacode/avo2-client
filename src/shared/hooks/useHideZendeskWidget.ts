import { type Avo } from '@viaa/avo2-types';
import { useEffect } from 'react';
import type { RouteComponentProps } from 'react-router-dom';

import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const';
import { ROUTE_PARTS } from '../constants';

export function useHideZendeskWidget(
	location: RouteComponentProps['location'],
	commonUser?: Avo.User.CommonUser,
	hideRegardless?: boolean
) {
	const isAdminRoute = new RegExp(`^/${ROUTE_PARTS.admin}`, 'g').test(location.pathname);
	const isPupilUser = [SpecialUserGroupId.PupilSecondary, SpecialUserGroupId.PupilElementary]
		.map(String)
		.includes(String(commonUser?.userGroup?.id));

	useEffect(() => {
		const shouldHide = isPupilUser || isAdminRoute;

		if (shouldHide || hideRegardless) {
			document.body.classList.add('hide-zendesk-widget');
		} else if (!shouldHide) {
			document.body.classList.remove('hide-zendesk-widget');
		}
	}, [isAdminRoute, isPupilUser, hideRegardless]);
}
