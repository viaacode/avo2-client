import React, { FunctionComponent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router';

import { Button, Spacer } from '@viaa/avo2-components';

import {
	redirectToServerACMIDMLogin,
	redirectToServerItsmeLogin,
	redirectToServerKlascementLogin,
	redirectToServerLoginPage,
	redirectToServerSmartschoolLogin,
} from '../helpers/redirects';

import './LoginOptions.scss';

export interface LoginOptionsProps extends RouteComponentProps {
	onOptionClicked?: () => void;
}

const LoginOptions: FunctionComponent<LoginOptionsProps> = ({
	location,
	onOptionClicked = () => {},
}) => {
	const [t] = useTranslation();

	return (
		<div className="m-login-options">
			<Spacer margin="bottom-large">
				<Spacer margin="top-small">
					<Button
						block
						label={t(
							'authentication/components/login-options___inloggen-met-e-mailadres'
						)}
						type="primary"
						className="c-login-with-archief"
						onClick={() => {
							onOptionClicked();
							redirectToServerLoginPage(location);
						}}
					/>
				</Spacer>
			</Spacer>
			<p>
				<Trans i18nKey="authentication/components/login-options___of-kies-voor">
					Of kies voor ...
				</Trans>
			</p>
			<Spacer margin={['top-small', 'bottom-small']}>
				<Button
					block
					type="secondary"
					className="c-button-itsme"
					icon="itsme"
					iconType="multicolor"
					label={t('authentication/components/login-options___itsme')}
					onClick={() => {
						onOptionClicked();
						redirectToServerItsmeLogin(location);
					}}
				/>
			</Spacer>
			<Spacer margin={['top-small', 'bottom-small']}>
				<Button
					block
					type="secondary"
					className="c-button-acmidm"
					icon="eid"
					label={t(
						'authentication/components/login-options___e-id-of-een-digitale-sleutel'
					)}
					onClick={() => {
						onOptionClicked();
						redirectToServerACMIDMLogin(location);
					}}
				/>
			</Spacer>
			<Spacer margin={['top-small', 'bottom-small']}>
				<Button
					block
					className="c-button-smartschool"
					icon="smartschool"
					label={t('authentication/components/login-options___inloggen-met-smartschool')}
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
				label={t('authentication/components/login-options___inloggen-met-klas-cement')}
				onClick={() => {
					onOptionClicked();
					redirectToServerKlascementLogin(location);
				}}
			/>
		</div>
	);
};

export default LoginOptions;
