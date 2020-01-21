import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { withRouter } from 'react-router';

import {
	Button,
	Container,
	Navbar,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
} from '@viaa/avo2-components';
import { RouteConfigComponentProps } from 'react-router-config';

interface TopbarProps extends RouteConfigComponentProps {
	showBackButton?: boolean;
}

const TopBar: FunctionComponent<TopbarProps> = ({ showBackButton = false, history }) => {
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

export default withRouter(TopBar);
