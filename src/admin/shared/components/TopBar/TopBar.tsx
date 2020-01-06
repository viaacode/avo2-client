import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

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

const TopBar: FunctionComponent<TopbarProps> = ({ navigateBack }) => {
	const [t] = useTranslation();

	return (
		<Navbar className="c-top-bar">
			<Container mode="horizontal">
				<Toolbar>
					<ToolbarLeft>
						<ToolbarItem>
							{navigateBack && (
								<Button
									className="c-top-bar__back"
									icon="chevron-left"
									label={t('admin/shared/components/top-bar/top-bar___terug')}
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
};

export default TopBar;
