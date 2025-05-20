import AvoLogo from '@assets/images/avo-logo-centered.svg';
import { Column, Grid, Icon, IconName, Spacer, Tabs } from '@viaa/avo2-components';
import React, { type FC } from 'react';
import { withRouter } from 'react-router';

import { LoginOptionsTabs } from '../../authentication/components/LoginOptions';
import LoginOptionsForPupil from '../../authentication/components/LoginOptionsForPupil';
import './RegisterOrLogin.scss';
import LoginOptionsForTeacher from '../../authentication/components/LoginOptionsForTeacher';
import { getEnv } from '../../shared/helpers/env';
import { tText } from '../../shared/helpers/translate-text';
import { useTabs } from '../../shared/hooks/useTabs';
import useTranslation from '../../shared/hooks/useTranslation';

const RegisterOrLogin: FC = () => {
	const { tHtml } = useTranslation();
	const [tab, setActiveTab, tabs] = useTabs(
		[
			{
				label: tText('authentication/components/login-options___leerling'),
				id: LoginOptionsTabs.TEACHER,
				icon: IconName.userTeacher,
			},
			{
				label: tText('authentication/components/login-options___leerling'),
				id: LoginOptionsTabs.STUDENT,
				icon: IconName.userStudent,
			},
		],
		LoginOptionsTabs.TEACHER
	);

	const renderTitle = () => {
		switch (tab) {
			case LoginOptionsTabs.TEACHER:
				return (
					<>
						<Icon name={IconName.userTeacher} />
						{tHtml('authentication/components/login-options___log-in-als-lesgever')}
					</>
				);

			case LoginOptionsTabs.STUDENT:
				return (
					<>
						<Icon name={IconName.userStudent} />
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
				return <LoginOptionsForTeacher />;

			case LoginOptionsTabs.STUDENT:
				return <LoginOptionsForPupil />;

			default:
				break;
		}
	};

	return (
		<div className="c-register-login-view">
			<Spacer className="m-register-login__tabs-wrapper" margin={'bottom'}>
				<Tabs tabs={tabs} onClick={(id) => setActiveTab(id)} />
			</Spacer>
			<Grid className="u-bg-gray-100" noWrap>
				<Column size="3-6" className="u-text-center">
					<img className="avo-logo" alt="Archief voor Onderwijs logo" src={AvoLogo} />
					{tab === LoginOptionsTabs.TEACHER && (
						<>
							<h2 className="c-h2 u-m-0 u-padding-top-l">
								{tHtml('embed/components/register-or-login___nog-geen-account')}
							</h2>
							<a
								href={getEnv('REGISTER_URL')}
								target="_blank"
								rel="noopener noreferrer"
							>
								{tHtml(
									'embed/components/register-or-login___account-aanmaken-als-lesgever'
								)}
							</a>
						</>
					)}
				</Column>
				<Column size="3-6" className="u-bg-white">
					<div className="m-login-options__wrapper">
						<Spacer margin={['bottom-large']}>
							<h2 className="c-h3 u-m-0 m-login-options__title">{renderTitle()}</h2>
						</Spacer>
						{getButtons()}
					</div>
				</Column>
			</Grid>
		</div>
	);
};

export default withRouter(RegisterOrLogin);
