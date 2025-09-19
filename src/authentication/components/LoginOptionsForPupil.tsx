import { Button, IconName, Spacer } from '@viaa/avo2-components';
import { noop } from 'lodash-es';
import React, { type FC } from 'react';

import useTranslation from '../../shared/hooks/useTranslation';
import {
	redirectToServerLeerIDLogin,
	redirectToServerLoginPage,
	redirectToServerSmartschoolLogin,
} from '../helpers/redirects';

import './LoginOptionsForPupil.scss';
import { useLocation } from 'react-router-dom';

interface LoginOptionsForPupilProps {
	onOptionClicked?: () => void;
	openInNewTab?: boolean;
}

const LoginOptionsForPupil: FC<LoginOptionsForPupilProps> = ({
	onOptionClicked = noop,
	openInNewTab = false,
}) => {
	const { tText } = useTranslation();
	const location = useLocation();

	const getButtons = () => {
		return [
			<Button
				key="login-button-leerid-pupil"
				block
				type="secondary"
				className="c-button-leerid"
				icon={IconName.leerid}
				iconType="custom"
				label={tText('authentication/components/login-options___leerling-id')}
				title={tText('authentication/components/login-options___leerling-id')}
				onClick={() => {
					onOptionClicked();
					redirectToServerLeerIDLogin(location, openInNewTab);
				}}
			/>,

			<Button
				key="login-button-smartschool-pupil"
				block
				className="c-button-smartschool"
				icon={IconName.smartschool}
				label={tText('authentication/components/login-options___inloggen-met-smartschool')}
				title={tText('authentication/components/login-options___inloggen-met-smartschool')}
				onClick={() => {
					onOptionClicked();
					redirectToServerSmartschoolLogin(location, openInNewTab);
				}}
			/>,

			<Button
				key="login-button-archief-pupil"
				block
				label={tText('authentication/components/login-options___inloggen-met-e-mailadres')}
				title={tText('authentication/components/login-options___inloggen-met-e-mailadres')}
				type="inline-link"
				className="c-login-with-archief c-button-mail c-login-button--pupil"
				onClick={() => {
					onOptionClicked();
					redirectToServerLoginPage(location, openInNewTab);
				}}
			/>,
		];
	};

	return getButtons()?.map((button) => (
		<Spacer key={`button--${button.props.className}`} margin={['top-small', 'bottom-small']}>
			{button}
		</Spacer>
	));
};

export default LoginOptionsForPupil;
