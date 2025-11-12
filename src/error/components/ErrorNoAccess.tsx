import { Blankslate, Button, Container, IconName } from '@viaa/avo2-components';
import React, { type FC, type ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { APP_PATH } from '../../constants.js';
import { OrderedList } from '../../shared/components/OrderedList/OrderedList.js';

import './ErrorNoAccess.scss';
import { tText } from '../../shared/helpers/translate-text.js';

interface ErrorNoAccessProps {
	title: string | ReactNode;
	message: string | ReactNode;
}

export const ErrorNoAccess: FC<ErrorNoAccessProps> = ({ title, message }) => {
	const navigateFunc = useNavigate();

	const goToWorkspace = () => {
		navigateFunc(APP_PATH.WORKSPACE.route);
	};

	return (
		<div className="c-error-no-access">
			<Container mode="vertical" background="alt">
				<Container size="medium" mode="horizontal">
					<Blankslate icon={IconName.lock} title={title}>
						<p>{message}</p>
					</Blankslate>
				</Container>
			</Container>
			<div className="c-ordered-list-container">
				<OrderedList
					listItems={[
						tText('error/components/error-no-access___stap-1'),
						tText('error/components/error-no-access___stap-2'),
						tText('error/components/error-no-access___stap-3'),
						tText('error/components/error-no-access___stap-4'),
					]}
				/>
				<Button
					onClick={goToWorkspace}
					label={tText('error/components/error-no-access___terug-naar-werkruimte')}
					className="c-ordered-list-container__button"
				/>
			</div>
		</div>
	);
};
