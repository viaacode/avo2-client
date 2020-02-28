import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router';

import {
	Button,
	Container,
	Navbar,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
} from '@viaa/avo2-components';

interface TopbarProps extends RouteComponentProps {
	showBackButton?: boolean;
}

export const TopBarComponent: FunctionComponent<TopbarProps> = ({
	showBackButton = false,
	history,
}) => {
	const [t] = useTranslation();

	return (
		<Navbar className="c-top-bar">
			<Container mode="horizontal">
				<Toolbar>
					<ToolbarLeft>
						<ToolbarItem>
							{showBackButton && (
								<Button
									className="c-top-bar__back"
									icon="chevron-left"
									label={t('admin/shared/components/top-bar/top-bar___terug')}
									onClick={history.goBack}
									type="link"
								/>
							)}
						</ToolbarItem>
					</ToolbarLeft>
				</Toolbar>
			</Container>
		</Navbar>
	);
};

export const TopBar = withRouter(TopBarComponent);
