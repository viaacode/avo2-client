import React, { FunctionComponent, MouseEvent } from 'react';

import classNames from 'classnames';

import { Icon } from '../Icon/Icon';

export interface ButtonProps {
	label?: string;
	type?:
		| 'primary'
		| 'secondary'
		| 'secondary-i'
		| 'tertiary'
		| 'borderless'
		| 'borderless-i'
		| 'danger'
		| 'danger-hover'
		| 'link';
	size?: 'small';
	block?: boolean;
	icon?: string;
	arrow?: boolean;
	disabled?: boolean;
	className?: string;
	active?: boolean;
	onClick?(event: MouseEvent<HTMLElement>): void;
}

const Button: FunctionComponent<ButtonProps> = ({
	label,
	type,
	size,
	block = false,
	icon,
	arrow,
	disabled,
	className,
	onClick,
	active,
}: ButtonProps) => (
	<button
		className={classNames(`c-button ${className}`, {
			active,
			'c-button-action': active,
			'c-button--small': size === 'small',
			'c-button--block': block,
			'c-button--icon': icon && !label,
			[`c-button--${type}`]: type,
		})}
		onClick={onClick}
		disabled={disabled}
	>
		<div className="c-button__content">
			{icon && <Icon name={icon} />}
			{label && <div className="c-button__label">{label}</div>}
			{arrow && <Icon name="caret-down" />}
		</div>
	</button>
);

Button.defaultProps = {
	type: 'primary',
};

export { Button };
