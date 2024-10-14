import {
	ButtonToolbar,
	Container,
	Navbar,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
} from '@viaa/avo2-components';
import classnames from 'classnames';
import React, { type FC, type ReactNode } from 'react';

import './ActionsBar.scss';

interface ActionsBarProps {
	children?: ReactNode;
	fixed?: boolean;
}

export const ActionsBar: FC<ActionsBarProps> = ({ children, fixed }) => {
	return (
		<Navbar
			autoHeight
			className={classnames('c-actions-bar', { 'c-actions-bar--fixed': fixed })}
			background="alt"
			placement="bottom"
		>
			<Container mode="vertical" size="small">
				<Container mode="horizontal">
					<Toolbar autoHeight>
						<ToolbarLeft>
							<ToolbarItem>
								<ButtonToolbar>{children}</ButtonToolbar>
							</ToolbarItem>
						</ToolbarLeft>
					</Toolbar>
				</Container>
			</Container>
		</Navbar>
	);
};
