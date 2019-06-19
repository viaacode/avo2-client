import React, { FunctionComponent, ReactNode } from 'react';

export interface ToolbarTitleProps {
	children: ReactNode;
}

export const ToolbarTitle: FunctionComponent<ToolbarTitleProps> = ({
	children,
}: ToolbarTitleProps) => {
	return <h2 className="c-toolbar__title">{children}</h2>;
};
