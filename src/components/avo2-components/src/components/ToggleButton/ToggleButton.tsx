import React, { FunctionComponent, useEffect, useState } from 'react';

import { Button } from '../Button/Button';

export interface ToggleButtonProps {
	icon: 'heart' | 'bookmark';
	active: boolean;
	onClick?: (active: boolean) => void;
}

export const ToggleButton: FunctionComponent<ToggleButtonProps> = ({
	icon,
	active,
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

	return <Button icon={getIcon()} type="borderless" active={filled} onClick={onButtonClick} />;
};
