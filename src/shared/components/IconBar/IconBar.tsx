import React, { FC } from 'react';

import { Icon, IconProps } from '@viaa/avo2-components';

import './IconBar.scss';

export interface IconBarProps {
	icon?: IconProps;
}

const IconBar: FC<IconBarProps> = ({
	children,
	icon = {
		name: 'x',
	},
}) => (
	<div className="c-icon-bar">
		<div className="c-icon-bar__sidebar">
			<Icon {...icon}></Icon>
		</div>
		<div className="c-icon-bar__content">{children}</div>
	</div>
);

export default IconBar;
