import React, { FunctionComponent, ReactNode } from 'react';

export interface ColumnProps {
	size:
		| '1'
		| '2'
		| '3'
		| '4'
		| '5'
		| '6'
		| '7'
		| '8'
		| '9'
		| '10'
		| '11'
		| '12'
		| 'static'
		| 'flex';
	children: ReactNode;
}

export const Column: FunctionComponent<ColumnProps> = ({ size, children }: ColumnProps) => (
	<div className={`o-grid-col-${size}`}>{children}</div>
);
