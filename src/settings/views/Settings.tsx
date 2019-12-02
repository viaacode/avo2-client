import React, { FunctionComponent, ReactElement, ReactText, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { Container, Navbar, Tabs, Toolbar, ToolbarLeft } from '@viaa/avo2-components';

import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { buildLink } from '../../shared/helpers';
import toastService from '../../shared/services/toast-service';

import { Account, Email, Notifications, Profile } from '../components';
import {
	ACCOUNT_ID,
	EMAIL_ID,
	NOTIFICATIONS_ID,
	PROFILE_ID,
	SETTINGS_PATH,
	SettingsTab,
} from '../settings.const';

interface ForPupilsProps extends RouteComponentProps<{ tabId: string }> {}

const Settings: FunctionComponent<ForPupilsProps> = ({ history, match }) => {
	const [activeTab, setActiveTab] = useState<SettingsTab>(match.params.tabId || PROFILE_ID);

	const tabHeaders = [
		{
			active: activeTab === PROFILE_ID,
			label: 'Profiel',
			id: PROFILE_ID,
			onClick: () => setActiveTab(PROFILE_ID),
		},
		{
			active: activeTab === ACCOUNT_ID,
			label: 'Account',
			id: ACCOUNT_ID,
			onClick: () => setActiveTab(ACCOUNT_ID),
		},
		{
			active: activeTab === EMAIL_ID,
			label: 'E-mail voorkeuren',
			id: EMAIL_ID,
			onClick: () => setActiveTab(EMAIL_ID),
		},
		{
			active: activeTab === NOTIFICATIONS_ID,
			label: 'Notifications',
			id: NOTIFICATIONS_ID,
			onClick: () => setActiveTab(NOTIFICATIONS_ID),
		},
	];

	const tabContents = {
		[PROFILE_ID]: {
			component: <Profile />,
		},
		[ACCOUNT_ID]: {
			component: <Account />,
		},
		[EMAIL_ID]: {
			component: <Email />,
		},
		[NOTIFICATIONS_ID]: {
			component: <Notifications />,
		},
	};

	const goToTab = (tabId: string | ReactText) => {
		redirectToClientPage(buildLink(SETTINGS_PATH.SETTINGS_TAB, { tabId }), history);
		setActiveTab(tabId as SettingsTab);
	};

	const getActiveTabComponent = (): ReactElement | null => {
		let tab = tabContents[activeTab];
		if (!tab) {
			toastService.danger(`Het instellingen tab ${activeTab} bestaat niet`);
			tab = tabContents[PROFILE_ID];
		}
		return tab.component;
	};

	return (
		<>
			<Container background="alt" mode="vertical" size="small">
				<Container mode="horizontal">
					<h2 className="c-h2 u-m-0">Instellingen</h2>
				</Container>
			</Container>

			<Navbar background="alt" placement="top" autoHeight>
				<Container mode="horizontal">
					<Toolbar autoHeight>
						<ToolbarLeft>
							<Tabs tabs={tabHeaders} onClick={goToTab} />
						</ToolbarLeft>
					</Toolbar>
				</Container>
			</Navbar>

			<Container mode="vertical" size="small">
				<Container mode="horizontal">{getActiveTabComponent()}</Container>
			</Container>
		</>
	);
};

export default withRouter(Settings);
