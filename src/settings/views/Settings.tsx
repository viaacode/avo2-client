import React, { FunctionComponent, ReactElement, ReactText, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { Container, Heading, Navbar, Tabs, Toolbar, ToolbarLeft } from '@viaa/avo2-components';

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

	const generateTabHeader = (id: string /* <- TODO */, label: string) => ({
		id,
		label,
		active: activeTab === id,
		onClick: () => setActiveTab(id),
	});

	const tabHeaders = [
		generateTabHeader(PROFILE_ID, 'Profiel'),
		generateTabHeader(ACCOUNT_ID, 'Account'),
		generateTabHeader(EMAIL_ID, 'E-mail voorkeuren'),
		generateTabHeader(NOTIFICATIONS_ID, 'Notifications'),
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
					<Heading type="h2" className="u-m-0">
						Instellingen
					</Heading>
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
