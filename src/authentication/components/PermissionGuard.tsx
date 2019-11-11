import React, { FunctionComponent, ReactNode } from 'react';

import { Avo } from '@viaa/avo2-types';

import { useSlot } from '../../shared/hooks/useSlot'; // TODO: replace this with avo2-components useSlot once exported
import { Permissions, PermissionService } from '../helpers/permission-service';
import { PermissionGuardFail, PermissionGuardPass } from './PermissionGuard.slots';

export interface PermissionGuardProps {
	children: ReactNode;
	permissions: Permissions;
	profile: Avo.User.Profile | null;
}

const PermissionGuard: FunctionComponent<PermissionGuardProps> = ({
	children,
	permissions,
	profile,
}) => {
	const childrenIfPassed = useSlot(PermissionGuardPass, children);
	const childrenIfFailed = useSlot(PermissionGuardFail, children);

	const hasPermission = PermissionService.hasPermissions(permissions, profile);
	return hasPermission ? (
		<>{!!childrenIfPassed ? childrenIfPassed : children}</>
	) : (
		<>{childrenIfFailed}</>
	);
};

export default PermissionGuard;
