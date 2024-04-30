import { Icon, IconName, type IconProps } from '@viaa/avo2-components';
import React, { type FC, type ReactNode } from 'react';

import './IconBar.scss';

export interface IconBarProps {
	children?: ReactNode;
	icon?: IconProps;
}

const IconBar: FC<IconBarProps> = ({
	children,
	icon = {
		name: IconName.x,
	},
}) => (
	<div className="c-icon-bar">
		<div className="c-icon-bar__sidebar">
			<Icon {...icon} />
		</div>
		<div className="c-icon-bar__content">{children}</div>
	</div>
);

export default IconBar;
