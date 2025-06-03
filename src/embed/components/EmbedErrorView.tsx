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

import useTranslation from '../../shared/hooks/useTranslation';

import './EmbedErrorView.scss';

export interface EmbedErrorViewProps {
	message: string | ReactNode;
	icon?: IconName | null;
}

export const EmbedErrorView: FC<EmbedErrorViewProps> = ({ message, icon }) => {
	const { tText } = useTranslation();
	const errorMessage: string | ReactNode = isNotFoundError
		? tHtml('embed/components/embed-error-view___deze-video-is-niet-meer-beschikbaar')
		: tHtml(
				'embed/components/error-view___oeps-er-liep-iets-mis-probeer-het-opnieuw-br-lukt-het-nog-steeds-niet-dan-is-dit-fragment-mogelijks-verwijderd'
		  );

	return (
		<Container mode="vertical" background="alt" className="m-error-view">
			<Container size="medium" mode="horizontal">
				<Blankslate
					body=""
					icon={icon || IconName.alertTriangle}
					title={message}
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
