import { FunctionComponent, ReactElement } from 'react';

export interface PermissionGuardSlotProps {
	children: ReactElement;
}

export const PermissionGuardPass: FunctionComponent<PermissionGuardSlotProps> = ({
	children,
}: PermissionGuardSlotProps) => children;

export const PermissionGuardFail: FunctionComponent<PermissionGuardSlotProps> = ({
	children,
}: PermissionGuardSlotProps) => children;
