import React, { FunctionComponent, ReactNode } from 'react';

import { Icon } from '../Icon/Icon';

import classNames from 'classnames';

export interface BlankslateProps {
	title: string;
	body: string;
	spacious?: boolean;
	icon?: string;
	children?: ReactNode;
}

export const Blankslate: FunctionComponent<BlankslateProps> = ({
	title,
	body,
	spacious,
	icon,
	children,
}: BlankslateProps) => (
	<div className={classNames('c-blankslate', { 'c-blankslate--spacious': spacious })}>
		{icon && (
			<div className="u-spacer-bottom-l">
				<div className="c-blankslate__icon">
					<Icon name={icon} size="large" />
				</div>
			</div>
		)}
		<h4 className="c-h4">{title}</h4>
		<p className="c-body-1">{body}</p>
		{children}
	</div>
);
