import React, { FunctionComponent, ReactNode } from 'react';

import classNames from 'classnames';

export interface ContainerProps {
	mode?: 'horizontal' | 'vertical';
	size?: 'small' | 'medium' | 'large';
	background?: 'white' | 'alt' | 'inverse';
	bordered?: boolean;
	children: ReactNode;
}

export const Container: FunctionComponent<ContainerProps> = ({
	mode,
	size,
	background,
	bordered,
	children,
}: ContainerProps) => (
	<div
		className={classNames({
			'o-container': mode === 'horizontal',
			'o-container-vertical': mode === 'vertical',
			[`o-container--${size}`]: mode === 'horizontal' && size,
			[`o-container-vertical--${size}`]: mode === 'vertical' && size,
			[`o-container-vertical--padding-${size}`]: mode === 'vertical' && size,
			[`o-container-vertical--bg-${background}`]: background,
			'o-container-vertical--bottom-bordered': bordered,
		})}
	>
		{children}
	</div>
);
