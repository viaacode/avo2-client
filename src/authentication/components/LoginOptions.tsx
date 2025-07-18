import { Button, Icon, IconName, Spacer, Tabs } from '@viaa/avo2-components';
import { noop } from 'lodash-es';
import React, { type FC, useEffect } from 'react';
import { type RouteComponentProps } from 'react-router';
import { Link, withRouter } from 'react-router-dom';

import { APP_PATH } from '../../constants';
import { NOT_NOW_LOCAL_STORAGE_KEY } from '../../shared/constants';
import { useTabs } from '../../shared/hooks/useTabs';
import useTranslation from '../../shared/hooks/useTranslation';
import { redirectToClientPage } from '../helpers/redirects/redirect-to-client-page';

import './LoginOptions.scss';
import LoginOptionsForPupil from './LoginOptionsForPupil';
import LoginOptionsForTeacher from './LoginOptionsForTeacher';

interface LoginOptionsProps {
	onOptionClicked?: () => void;
}

const LoginOptionsPreferredTabStorageKey = 'LoginOptions.preference';

export const LoginOptionsTabs = {
	TEACHER: 'lesgever',
	STUDENT: 'leerling',
};

const LoginOptions: FC<LoginOptionsProps & RouteComponentProps> = ({
	history,
	onOptionClicked = noop,
}) => {
	const { tText, tHtml } = useTranslation();
	const [tab, setActiveTab, tabs] = useTabs(
		[
			{
				label: tText('authentication/components/login-options___lesgever'),
				id: LoginOptionsTabs.TEACHER,
				icon: IconName.userTeacher,
			},
			{
				label: tText('authentication/components/login-options___leerling'),
				id: LoginOptionsTabs.STUDENT,
				icon: IconName.userStudent,
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
				return tHtml('authentication/components/login-options___log-in-als-lesgever');

			case LoginOptionsTabs.STUDENT:
				return tHtml('authentication/components/login-options___log-in-als-leerling');

			default:
				break;
		}
	};

	const getButtons = () => {
		switch (tab) {
			case LoginOptionsTabs.TEACHER:
				return (
					<LoginOptionsForTeacher
						onOptionClicked={onOptionClicked}
						openInNewTab={false}
					/>
				);

			case LoginOptionsTabs.STUDENT:
				return (
					<LoginOptionsForPupil onOptionClicked={onOptionClicked} openInNewTab={false} />
				);

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

				{getButtons()}

				<hr />

				{renderFallbackTitle()}

				<Spacer margin={['top-small']}>{renderFallbackButton()}</Spacer>
			</div>
		</div>
	);
};

export default withRouter(LoginOptions);
