import React, { FunctionComponent } from 'react';

import classNames from 'classnames';

export interface BadgeProps {
	text: string;
	type?: 'default' | 'success' | 'error';
}

export const Badge: FunctionComponent<BadgeProps> = ({ text, type = 'default' }: BadgeProps) => (
	<div className={classNames('c-badge', { [`c-badge--${type}`]: type })}>{text}</div>
);
