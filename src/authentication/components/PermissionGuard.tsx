import React, { Fragment, FunctionComponent, ReactNode } from 'react';

import { Permissions, PermissionService } from '../helpers/PermissionService';

export interface PermissionGuardProps {
	children: ReactNode;
	permissions: Permissions;
}

const PermissionGuard: FunctionComponent<PermissionGuardProps> = ({ children, permissions }) => {
	return PermissionService.hasPermissions(permissions) ? <Fragment>{children}</Fragment> : null;
};

export default PermissionGuard;
