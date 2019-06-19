import React, { FunctionComponent, useEffect, useState } from 'react';

import { Button } from '../Button/Button';

export interface ToggleButtonProps {
	icon: 'heart' | 'bookmark';
	active: boolean;
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
	onClick?: (active: boolean) => void;
}

export const ToggleButton: FunctionComponent<ToggleButtonProps> = ({
	icon,
	active,
	type = 'borderless',
	onClick = () => {},
}: ToggleButtonProps) => {
	const [filled, setFilled] = useState(active);

	useEffect(() => {
		// sync up `active`-prop with filled-state
		setFilled(active);
	}, [active]);

	function onButtonClick() {
		setFilled(!filled);
		if (onClick) {
			onClick(!filled);
		}
	}

	function getIcon() {
		if (filled) {
			return `${icon}-filled`;
		}

		return icon;
	}

	return <Button icon={getIcon()} type={type} active={filled} onClick={onButtonClick} />;
};
