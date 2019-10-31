import React, { FunctionComponent } from 'react';

import {
	Button,
	Container,
	Navbar,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
} from '@viaa/avo2-components';

interface TopbarProps {
	navigateBack: (() => void) | null;
}

export const TopBar: FunctionComponent<TopbarProps> = ({ navigateBack }) => (
	<Navbar className="c-top-bar">
		<Container mode="horizontal">
			<Toolbar>
				<ToolbarLeft>
					<ToolbarItem>
						{navigateBack && (
							<Button
								className="c-top-bar__back"
								icon="chevron-left"
								onClick={navigateBack}
								type="link"
							/>
						)}
					</ToolbarItem>
				</ToolbarLeft>
			</Toolbar>
		</Container>
	</Navbar>
);
