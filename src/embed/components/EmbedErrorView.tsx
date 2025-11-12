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

import './EmbedErrorView.scss';
import { tText } from '../../shared/helpers/translate-text.js';

export interface EmbedErrorViewProps {
	message: string | ReactNode;
	icon?: IconName | null;
	onReload?: (() => void) | null;
}

export const EmbedErrorView: FC<EmbedErrorViewProps> = ({ message, icon, onReload }) => {
	return (
		<Container mode="vertical" background="alt" className="m-error-view">
			<Container size="medium" mode="horizontal">
				<Blankslate
					body=""
					icon={icon || IconName.alertTriangle}
					title={message}
					className="c-content"
				>
					{onReload && (
						<Toolbar>
							<ToolbarCenter>
								<ButtonToolbar>
									<Button
										type="primary"
										onClick={onReload}
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
