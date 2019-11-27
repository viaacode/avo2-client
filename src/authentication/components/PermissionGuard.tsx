import React, { FunctionComponent, ReactNode } from 'react';

import { useSlot } from '@viaa/avo2-components';

import { Permissions, PermissionService } from '../helpers/permission-service';
import { PermissionGuardFail, PermissionGuardPass } from './PermissionGuard.slots';

export interface PermissionGuardProps {
	children: ReactNode;
	permissions: Permissions;
}

const PermissionGuard: FunctionComponent<PermissionGuardProps> = ({ children, permissions }) => {
	const childrenIfPassed = useSlot(PermissionGuardPass, children);
	const childrenIfFailed = useSlot(PermissionGuardFail, children);

	const hasPermission = PermissionService.hasPermissions(permissions);
	return hasPermission ? (
		<>{!!childrenIfPassed ? childrenIfPassed : children}</>
	) : (
		<>{childrenIfFailed}</>
	);
};

export default PermissionGuard;
