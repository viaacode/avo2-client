import React, { FunctionComponent, ReactNode } from 'react';

import {
	ButtonToolbar,
	Container,
	Navbar,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';

interface ActionsBarprops {
	children?: ReactNode;
}

export const ActionsBar: FunctionComponent<ActionsBarprops> = ({ children }) => {
	return (
		<Navbar autoHeight className="c-actions-bar" background="alt" placement="bottom">
			<Container mode="vertical" size="small">
				<Container mode="horizontal">
					<Toolbar>
						<ToolbarLeft>
							<ToolbarItem>
								<ButtonToolbar>{children}</ButtonToolbar>
							</ToolbarItem>
						</ToolbarLeft>
						<ToolbarRight>
							<ToolbarItem>
								<ButtonToolbar>{children}</ButtonToolbar>
							</ToolbarItem>
						</ToolbarRight>
					</Toolbar>
				</Container>
			</Container>
		</Navbar>
	);
};
