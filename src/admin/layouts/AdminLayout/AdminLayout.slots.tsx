import React, { FunctionComponent, ReactElement } from 'react';

interface AdminLayoutSlotProps {
	children: ReactElement | ReactElement[];
}

export const AdminLayoutActions: FunctionComponent<AdminLayoutSlotProps> = ({ children }) => (
	<>{children}</>
);
export const AdminLayoutBody: FunctionComponent<AdminLayoutSlotProps> = ({ children }) => (
	<>{children}</>
);
