import React, { FunctionComponent } from 'react';
import { RouteComponentProps } from 'react-router';

import { Button, Spacer } from '@viaa/avo2-components';

import { APP_PATH } from '../../constants';
import toastService from '../../shared/services/toast-service';

import { redirectToClientPage, redirectToServerSmartschoolLogin } from '../helpers/redirects';

import './LoginOptions.scss';

export interface LoginOptionsProps extends RouteComponentProps {
	onOptionClicked?: () => void;
}

const LoginOptions: FunctionComponent<LoginOptionsProps> = ({
	history,
	location,
	onOptionClicked = () => {},
}) => (
	<div className="m-login-options">
		<Spacer margin="bottom-large">
			<Spacer margin="top-small">
				<Button
					block
					label="Inloggen met e-mailadres"
					type="primary"
					className="c-login-with-archief"
					onClick={() => {
						onOptionClicked();
						redirectToClientPage(APP_PATH.LOGIN_AVO, history);
					}}
				/>
			</Spacer>
		</Spacer>
		<p>Of kies voor ...</p>
		<Spacer margin={['top-small', 'bottom-small']}>
			<Button
				block
				className="c-button-smartschool"
				icon="smartschool"
				label="Inloggen met Smartschool"
				onClick={() => {
					onOptionClicked();
					redirectToServerSmartschoolLogin(location);
				}}
			/>
		</Spacer>
		<Button
			block
			className="c-button-klascement"
			icon="klascement"
			label="Inloggen met KlasCement"
			onClick={() => {
				onOptionClicked();
				toastService.info('Nog niet geïmplementeerd');
			}}
		/>
	</div>
);

export default LoginOptions;
