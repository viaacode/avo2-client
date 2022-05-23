import React, { FC } from 'react';

import './IconBar.scss';

export interface IconBarProps {}

const IconBar: FC<IconBarProps> = () => (
	<div className="c-icon-bar">
		<div className="c-icon-bar__sidebar"></div>
		<div className="c-iconbar__content"></div>
	</div>
);

export default IconBar;
