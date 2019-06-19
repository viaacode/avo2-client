import React, { FunctionComponent, ReactNode } from 'react';

import classnames from 'classnames';

export interface BoxProps {
	condensed?: boolean;
	children: ReactNode;
}

export const Box: FunctionComponent<BoxProps> = ({ condensed, children }: BoxProps) => (
	<div className={classnames('c-box', { 'c-box--padding-small': condensed })}>{children}</div>
);
