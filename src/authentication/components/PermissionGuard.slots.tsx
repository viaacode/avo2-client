import { FunctionComponent, ReactElement } from 'react';

export interface PermissionGuardSlotProps {
	children: ReactElement;
}

export const PermissionGuardPass: FunctionComponent<PermissionGuardSlotProps> = ({ children }) =>
	children;

export const PermissionGuardFail: FunctionComponent<PermissionGuardSlotProps> = ({ children }) =>
	children;
