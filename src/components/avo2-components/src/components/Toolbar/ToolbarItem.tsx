import React, { FunctionComponent, ReactNode } from 'react';

export interface ToolbarItemProps {
	children: ReactNode;
}

export const ToolbarItem: FunctionComponent<ToolbarItemProps> = ({
	children,
}: ToolbarItemProps) => {
	return <div className="c-toolbar__item">{children}</div>;
};
