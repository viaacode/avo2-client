import {
	Container,
	Icon,
	IconName,
	Spacer,
	Toolbar,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import React, { FC, ReactNode } from 'react';

import './AlertBar.scss';

interface AlertBarProps {
	icon?: IconName;
	textLeft: string;
	contentRight: ReactNode;
}

const AlertBar: FC<AlertBarProps> = ({ icon, textLeft, contentRight }) => {
	return (
		<div className="c-alert-bar">
			<Container mode="horizontal">
				<Toolbar>
					<ToolbarLeft>
						{icon && <Icon name={icon} />}
						<Spacer margin="left-small">{textLeft}</Spacer>
					</ToolbarLeft>
					<ToolbarRight>{contentRight}</ToolbarRight>
				</Toolbar>
			</Container>
		</div>
	);
};

export default AlertBar;
