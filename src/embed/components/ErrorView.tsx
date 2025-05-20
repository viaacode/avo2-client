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
						'embed/components/error-view___oeps-er-liep-iets-mis-probeer-het-opnieuw-br-lukt-het-nog-steeds-niet-dan-is-dit-fragment-mogelijks-verwijderd'
					)}
					className="c-content"
				>
					<Toolbar>
						<ToolbarCenter>
							<ButtonToolbar>
								<Button
									type="primary"
									onClick={() => window.location.reload()}
									label={tText('embed/components/error-view___probeer-opnieuw')}
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
