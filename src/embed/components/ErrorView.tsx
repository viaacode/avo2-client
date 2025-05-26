import {
	Blankslate,
	Button,
	ButtonToolbar,
	Container,
	IconName,
	Toolbar,
	ToolbarCenter,
} from '@viaa/avo2-components';
import React, { type FC, type ReactNode } from 'react';

import { tHtml } from '../../shared/helpers/translate-html';
import useTranslation from '../../shared/hooks/useTranslation';

import './ErrorView.scss';

interface ErrorViewProps {
	isNotFoundError?: boolean;
}

const ErrorView: FC<ErrorViewProps> = ({ isNotFoundError = false }) => {
	const { tText } = useTranslation();
	const errorMessage: string | ReactNode = isNotFoundError
		? tHtml('Deze video is niet meer beschikbaar')
		: tHtml(
				'embed/components/error-view___oeps-er-liep-iets-mis-probeer-het-opnieuw-br-lukt-het-nog-steeds-niet-dan-is-dit-fragment-mogelijks-verwijderd'
		  );

	return (
		<Container mode="vertical" background="alt" className="m-error-view">
			<Container size="medium" mode="horizontal">
				<Blankslate
					body=""
					icon={IconName.alertTriangle}
					title={errorMessage}
					className="c-content"
				>
					{!isNotFoundError && (
						<Toolbar>
							<ToolbarCenter>
								<ButtonToolbar>
									<Button
										type="primary"
										onClick={() => window.location.reload()}
										label={tText(
											'embed/components/error-view___probeer-opnieuw'
										)}
									/>
								</ButtonToolbar>
							</ToolbarCenter>
						</Toolbar>
					)}
				</Blankslate>
			</Container>
		</Container>
	);
};

export default ErrorView as FC<ErrorViewProps>;
