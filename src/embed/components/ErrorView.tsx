import {
	Blankslate,
	Button,
	ButtonToolbar,
	Container,
	IconName,
	Toolbar,
	ToolbarCenter,
} from '@viaa/avo2-components';
import React, { type FC } from 'react';
import { withRouter } from 'react-router';

import { tHtml } from '../../shared/helpers/translate-html';
import useTranslation from '../../shared/hooks/useTranslation';

import './ErrorView.scss';

const ErrorView: FC = () => {
	const { tText } = useTranslation();

	return (
		<Container mode="vertical" background="alt" className="m-error-view">
			<Container size="medium" mode="horizontal">
				<Blankslate
					body=""
					icon={IconName.alertTriangle}
					title={tHtml(
						'Oeps, er liep iets mis. Probeer het opnieuw.<br/> Lukt het nog steeds niet? Dan is dit fragment mogelijks verwijderd. '
					)}
					className="c-content"
				>
					<Toolbar>
						<ToolbarCenter>
							<ButtonToolbar>
								<Button
									type="primary"
									onClick={() => window.location.reload()}
									label={tText('Probeer opnieuw')}
								/>
							</ButtonToolbar>
						</ToolbarCenter>
					</Toolbar>
				</Blankslate>
			</Container>
		</Container>
	);
};

export default withRouter(ErrorView);
