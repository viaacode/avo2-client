import {
	Button,
	Icon,
	IconName,
	Spacer,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@viaa/avo2-components';
import { noop } from 'lodash-es';
import React, { type FC } from 'react';
import { type RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router-dom';

import { tHtml } from '../../shared/helpers/translate-html';
import useTranslation from '../../shared/hooks/useTranslation';
import {
	redirectToServerACMIDMLogin,
	redirectToServerItsmeLogin,
	redirectToServerKlascementLogin,
	redirectToServerLoginPage,
	redirectToServerSmartschoolLogin,
} from '../helpers/redirects';

import './LoginOptionsForTeacher.scss';

interface LoginOptionsForTeacherProps {
	onOptionClicked?: () => void;
	openInNewTab?: boolean;
}

const LoginOptionsForTeacher: FC<LoginOptionsForTeacherProps & RouteComponentProps> = ({
	location,
	onOptionClicked = noop,
	openInNewTab = false,
}) => {
	const { tText } = useTranslation();

	const getButtons = () => {
		return [
			<Button
				key="login-button-archief"
				block
				label={tText('authentication/components/login-options___inloggen-met-e-mailadres')}
				icon={IconName.at}
				type="primary"
				className="c-login-with-archief c-button-mail"
				onClick={() => {
					onOptionClicked();
					redirectToServerLoginPage(location, openInNewTab);
				}}
			/>,

			<>
				<hr />
				<h3 className="c-h4 u-m-0">
					{tText(
						'authentication/components/login-options-for-teacher___is-jouw-account-al-gekoppeld'
					)}
					<Tooltip position="bottom">
						<TooltipTrigger>
							<Icon className="a-info-icon" name={IconName.info} size="small" />
						</TooltipTrigger>
						<TooltipContent>
							<span>
								{tHtml(
									'authentication/components/login-options-for-teacher___account-tooltip-content'
								)}
							</span>
						</TooltipContent>
					</Tooltip>
				</h3>
			</>,

			<Button
				key="login-button-itsme"
				block
				type="secondary"
				className="c-button-itsme"
				icon={IconName.itsme}
				iconType="multicolor"
				label={tText('authentication/components/login-options___itsme')}
				onClick={() => {
					onOptionClicked();
					redirectToServerItsmeLogin(location, openInNewTab);
				}}
			/>,

			<Button
				key="login-button-acmidm"
				block
				type="secondary"
				className="c-button-acmidm"
				icon={IconName.eid}
				label={tText(
					'authentication/components/login-options___e-id-of-een-digitale-sleutel'
				)}
				onClick={() => {
					onOptionClicked();
					redirectToServerACMIDMLogin(location, openInNewTab);
				}}
			/>,

			<Button
				key="login-button-smartschool"
				block
				className="c-button-smartschool"
				icon={IconName.smartschool}
				label={tText('authentication/components/login-options___inloggen-met-smartschool')}
				onClick={() => {
					onOptionClicked();
					redirectToServerSmartschoolLogin(location, openInNewTab);
				}}
			/>,

			<Button
				key="login-button-klascement"
				block
				className="c-button-klascement"
				icon={IconName.klascement}
				label={tText('authentication/components/login-options___inloggen-met-klas-cement')}
				onClick={() => {
					onOptionClicked();
					redirectToServerKlascementLogin(location, openInNewTab);
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

export default withRouter(LoginOptionsForTeacher);
