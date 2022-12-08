import { Icon, IconProps } from '@viaa/avo2-components';
import React, { FC } from 'react';

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
			<Icon {...icon} />
		</div>
		<div className="c-icon-bar__content">{children}</div>
	</div>
);

export default IconBar;
