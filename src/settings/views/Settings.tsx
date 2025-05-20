import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import {
	Container,
	IconName,
	Navbar,
	Tabs,
	Toolbar,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { PermissionName } from '@viaa/avo2-types';
import React, { type FC, type ReactElement, type ReactText, useState } from 'react';

import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const';
import { type DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects/redirect-to-client-page';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';
import InteractiveTour from '../../shared/components/InteractiveTour/InteractiveTour';
import { buildLink } from '../../shared/helpers/build-link';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { ToastService } from '../../shared/services/toast-service';
import { getPageNotFoundError } from '../../shared/translations/page-not-found';
import Account from '../components/Account';
import Email from '../components/Email/Email';
import LinkedAccounts from '../components/LinkedAccounts';
import Notifications from '../components/Notifications';
import Profile from '../components/Profile';
import {
	ACCOUNT_ID,
	EMAIL_ID,
	LINKED_ACCOUNTS,
	NOTIFICATIONS_ID,
	PROFILE_ID,
	type SettingsTab,
} from '../settings.const';

type ForPupilsProps = DefaultSecureRouteProps<{ tabId: string }>;

const Settings: FC<ForPupilsProps & UserProps> = (props) => {
	const { tText, tHtml } = useTranslation();

	const [activeTab, setActiveTab] = useState<SettingsTab>(
		(props.match.params.tabId as SettingsTab) || PROFILE_ID
	);

	const isPupil = [SpecialUserGroupId.PupilSecondary, SpecialUserGroupId.PupilElementary]
		.map(String)
		.includes(String(props.commonUser?.userGroup?.id));

	const generateTabHeader = (id: SettingsTab, label: string) => ({
		id,
		label,
		active: activeTab === id,
		onClick: () => setActiveTab(id),
	});

	const getTabHeaders = () => {
		const tabHeaders = [
			generateTabHeader(PROFILE_ID, tText('settings/views/settings___profiel')),
		];

		// Only pupils with an archief account can view the account tab
		if (!isPupil || !!(props?.commonUser?.idps || {})['HETARCHIEF']) {
			tabHeaders.push(
				generateTabHeader(ACCOUNT_ID, tText('settings/views/settings___account'))
			);
		}

		tabHeaders.push(
			generateTabHeader(LINKED_ACCOUNTS, tText('settings/views/settings___koppelingen'))
		);

		if (PermissionService.hasPerm(props.commonUser, PermissionName.VIEW_NEWSLETTERS_PAGE)) {
			tabHeaders.push(
				generateTabHeader(EMAIL_ID, tText('settings/views/settings___e-mail-voorkeuren'))
			);
		}
		if (PermissionService.hasPerm(props.commonUser, PermissionName.VIEW_NOTIFICATIONS_PAGE)) {
			generateTabHeader(NOTIFICATIONS_ID, tText('settings/views/settings___notifications'));
		}

		return tabHeaders;
	};

	const tabContents = {
		[PROFILE_ID]: {
			component: <Profile {...props} />,
		},
		[ACCOUNT_ID]: {
			component: <Account {...props} />,
		},
		[EMAIL_ID]: {
			component: <Email {...props} />,
		},
		[NOTIFICATIONS_ID]: {
			component: <Notifications />,
		},
		[LINKED_ACCOUNTS]: {
			component: <LinkedAccounts {...props} />,
		},
	};

	const goToTab = (tabId: string | ReactText) => {
		redirectToClientPage(buildLink(APP_PATH.SETTINGS_TAB.route, { tabId }), props.history);
		setActiveTab(tabId as SettingsTab);
	};

	const getActiveTabComponent = (): ReactElement | null => {
		let tab = tabContents[activeTab];
		if (!tab) {
			ToastService.danger(
				tHtml('settings/views/settings___het-instellingen-tab-active-tab-bestaat-niet', {
					activeTab,
				})
			);
			tab = tabContents[PROFILE_ID];
		}
		return tab.component;
	};

	const viewNewsletterPage = PermissionService.hasPerm(
		props.commonUser,
		PermissionName.VIEW_NEWSLETTERS_PAGE
	);
	const viewNotificationsPage = PermissionService.hasPerm(
		props.commonUser,
		PermissionName.VIEW_NOTIFICATIONS_PAGE
	);
	if (
		!Object.keys(tabContents).includes(activeTab) ||
		(activeTab === EMAIL_ID && !viewNewsletterPage) ||
		(activeTab === NOTIFICATIONS_ID && !viewNotificationsPage)
	) {
		return (
			<ErrorView
				message={getPageNotFoundError(!!props.commonUser)}
				icon={IconName.search}
				actionButtons={['home', 'helpdesk']}
			/>
		);
	}

	return (
		<>
			<Container background="alt" mode="vertical" size="small">
				<Container mode="horizontal">
					<Toolbar>
						<ToolbarLeft>
							<BlockHeading type="h2" className="u-m-0">
								{tHtml('settings/views/settings___instellingen')}
							</BlockHeading>
						</ToolbarLeft>
						<ToolbarRight>
							<InteractiveTour showButton />
						</ToolbarRight>
					</Toolbar>
				</Container>
			</Container>

			<Navbar background="alt" placement="top" autoHeight>
				<Container mode="horizontal">
					<Toolbar autoHeight className="c-toolbar--no-height">
						<ToolbarLeft>
							<Tabs tabs={getTabHeaders()} onClick={goToTab} />
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

export default withUser(Settings) as FC<ForPupilsProps>;
