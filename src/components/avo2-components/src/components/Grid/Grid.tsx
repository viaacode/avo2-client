import React, { FunctionComponent, ReactNode } from 'react';

export interface GridProps {
	children: ReactNode;
}

export const Grid: FunctionComponent<GridProps> = ({ children }: GridProps) => (
	<div className="o-grid">{children}</div>
);
