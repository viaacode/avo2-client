import { Button, Icon, Spacer, Tabs } from '@viaa/avo2-components';
import { noop } from 'lodash-es';
import React, { FunctionComponent, useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

import { APP_PATH } from '../../constants';
import { NOT_NOW_LOCAL_STORAGE_KEY } from '../../shared/constants';
import { useTabs } from '../../shared/hooks';
import useTranslation from '../../shared/hooks/useTranslation';
import {
	redirectToClientPage,
	redirectToServerACMIDMLogin,
	redirectToServerItsmeLogin,
	redirectToServerKlascementLogin,
	redirectToServerLeerIDLogin,
	redirectToServerLoginPage,
	redirectToServerSmartschoolLogin,
} from '../helpers/redirects';

import './LoginOptions.scss';

export interface LoginOptionsProps extends RouteComponentProps {
	onOptionClicked?: () => void;
}

const LoginOptionsPreferredTabStorageKey = 'LoginOptions.preference';

const LoginOptionsTabs = {
	TEACHER: 'lesgever',
	STUDENT: 'leerling',
};

const LoginOptions: FunctionComponent<LoginOptionsProps> = ({
	history,
	location,
	onOptionClicked = noop,
}) => {
	const { tText, tHtml } = useTranslation();
	const [tab, setActiveTab, tabs] = useTabs(
		[
			{
				label: tText('authentication/components/login-options___lesgever'),
				id: LoginOptionsTabs.TEACHER,
				icon: 'user-teacher',
			},
			{
				label: tText('authentication/components/login-options___leerling'),
				id: LoginOptionsTabs.STUDENT,
				icon: 'user-student',
			},
		],
		localStorage?.getItem(LoginOptionsPreferredTabStorageKey) || LoginOptionsTabs.TEACHER
	);

	// Whenever a user sees the LoginOptions, reset their nudging
	useEffect(() => {
		localStorage.removeItem(NOT_NOW_LOCAL_STORAGE_KEY);
	}, []);

	const renderTitle = () => {
		switch (tab) {
			case LoginOptionsTabs.TEACHER:
				return (
					<>
						<Icon name="user-teacher" />
						{tHtml('authentication/components/login-options___log-in-als-lesgever')}
					</>
				);

			case LoginOptionsTabs.STUDENT:
				return (
					<>
						<Icon name="user-student" />
						{tHtml('authentication/components/login-options___log-in-als-leerling')}
					</>
				);

			default:
				break;
		}
	};

	const getButtons = () => {
		switch (tab) {
			case LoginOptionsTabs.TEACHER:
				return [
					<Button
						key="login-button-archief"
						block
						label={tText(
							'authentication/components/login-options___inloggen-met-e-mailadres'
						)}
						icon="at"
						type="primary"
						className="c-login-with-archief c-button-mail"
						onClick={() => {
							onOptionClicked();
							redirectToServerLoginPage(location);
						}}
					/>,

					<Button
						key="login-button-itsme"
						block
						type="secondary"
						className="c-button-itsme"
						icon="itsme"
						iconType="multicolor"
						label={tText('authentication/components/login-options___itsme')}
						onClick={() => {
							onOptionClicked();
							redirectToServerItsmeLogin(location);
						}}
					/>,

					<Button
						key="login-button-acmidm"
						block
						type="secondary"
						className="c-button-acmidm"
						icon="eid"
						label={tText(
							'authentication/components/login-options___e-id-of-een-digitale-sleutel'
						)}
						onClick={() => {
							onOptionClicked();
							redirectToServerACMIDMLogin(location);
						}}
					/>,

					<Button
						key="login-button-smartschool"
						block
						className="c-button-smartschool"
						icon="smartschool"
						label={tText(
							'authentication/components/login-options___inloggen-met-smartschool'
						)}
						onClick={() => {
							onOptionClicked();
							redirectToServerSmartschoolLogin(location);
						}}
					/>,

					<Button
						key="login-button-klascement"
						block
						className="c-button-klascement"
						icon="klascement"
						label={tText(
							'authentication/components/login-options___inloggen-met-klas-cement'
						)}
						onClick={() => {
							onOptionClicked();
							redirectToServerKlascementLogin(location);
						}}
					/>,
				];

			case LoginOptionsTabs.STUDENT:
				return [
					<Button
						key="login-button-archief-pupil"
						block
						label={tText(
							'authentication/components/login-options___inloggen-met-e-mailadres'
						)}
						icon="at"
						type="primary"
						className="c-login-with-archief c-button-mail"
						onClick={() => {
							onOptionClicked();
							redirectToServerLoginPage(location);
						}}
					/>,

					<Button
						key="login-button-leerid-pupil"
						block
						type="secondary"
						className="c-button-leerid"
						icon="leerid"
						iconType="multicolor"
						label={tText('authentication/components/login-options___leerling-id')}
						onClick={() => {
							onOptionClicked();
							redirectToServerLeerIDLogin(location);
						}}
					/>,

					<Button
						key="login-button-smartschool-pupil"
						block
						className="c-button-smartschool"
						icon="smartschool"
						label={tText(
							'authentication/components/login-options___inloggen-met-smartschool'
						)}
						onClick={() => {
							onOptionClicked();
							redirectToServerSmartschoolLogin(location);
						}}
					/>,
				];

			default:
				break;
		}
	};

	const renderFallbackTitle = () => {
		switch (tab) {
			case LoginOptionsTabs.TEACHER:
				return (
					<h3 className="c-h4 u-m-0">
						{tText('authentication/components/login-options___nog-geen-account')}
					</h3>
				);

			default:
				return null;
		}
	};

	const renderFallbackButton = () => {
		switch (tab) {
			case LoginOptionsTabs.TEACHER:
				return (
					<Button
						block
						label={tText(
							'authentication/views/register-or-login___account-aanmaken-als-lesgever'
						)}
						type="primary"
						onClick={() => {
							onOptionClicked();
							redirectToClientPage(APP_PATH.STAMBOEK.route, history);
						}}
					/>
				);

			case LoginOptionsTabs.STUDENT:
				return (
					<Link
						to="/faq-leerling?label=Toegang%20als%20leerling"
						onClick={onOptionClicked}
					>
						{tText(
							'authentication/views/register-or-login___krijg-toegang-als-leerling'
						)}
					</Link>
				);

			default:
				break;
		}
	};

	return (
		<div className="m-login-options">
			<Tabs
				tabs={tabs}
				onClick={(id) => {
					setActiveTab(id);
					localStorage.setItem(LoginOptionsPreferredTabStorageKey, id.toString());
				}}
			/>

			<div className="m-login-options__wrapper">
				<Spacer margin={['bottom-large']}>
					<h2 className="c-h3 u-m-0 m-login-options__title">{renderTitle()}</h2>
				</Spacer>

				{getButtons()?.map((button) => (
					<Spacer
						key={`button--${button.props.className}`}
						margin={['top-small', 'bottom-small']}
					>
						{button}
					</Spacer>
				))}

				<hr />

				{renderFallbackTitle()}

				<Spacer margin={['top-small']}>{renderFallbackButton()}</Spacer>
			</div>
		</div>
	);
};

export default LoginOptions;
