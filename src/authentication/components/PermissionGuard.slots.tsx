import { type FC, type ReactNode } from 'react'

export const PermissionGuardPass: FC<{ children?: ReactNode }> = ({
  children,
}) => <>{children}</>
export const PermissionGuardFail: FC<{ children?: ReactNode }> = ({
  children,
}) => <>{children}</>
