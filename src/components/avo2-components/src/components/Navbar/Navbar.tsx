import React, { FunctionComponent, ReactNode } from 'react';

import classNames from 'classnames';

export interface NavbarProps {
	placement?: 'top' | 'bottom';
	position?: 'fixed';
	spacing?: 'regular' | 'double';
	autoHeight?: boolean;
	background?: 'white' | 'alt' | 'inverse';
	children: ReactNode;
}

export const Navbar: FunctionComponent<NavbarProps> = ({
	placement = 'top',
	position,
	spacing = 'regular',
	autoHeight = false,
	background,
	children,
}: NavbarProps) => (
	<div
		className={classNames('c-navbar', {
			'c-navbar--bordered-bottom': placement === 'top', // Class indicates border location
			'c-navbar--bordered-top': placement === 'bottom',
			'c-navbar--fixed': position === 'fixed',
			'c-navbar--auto': autoHeight,
			'c-navbar--white': background === 'white',
			'c-navbar--bg-alt': background === 'alt',
			'c-navbar--inverse': background === 'inverse',
		})}
	>
		{children}
	</div>
);
