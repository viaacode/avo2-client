import { BlockHeading } from '@meemoo/admin-core-ui/client'
import {
  Container,
  IconName,
  Navbar,
  Tabs,
  Toolbar,
  ToolbarLeft,
  ToolbarRight,
} from '@viaa/avo2-components'
import { PermissionName } from '@viaa/avo2-types'
import { useAtomValue } from 'jotai'
import React, {
  type FC,
  type ReactElement,
  type ReactText,
  useState,
} from 'react'
import { useNavigate, useParams } from 'react-router'

import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const.js'
import { commonUserAtom } from '../../authentication/authentication.store.js'
import { PermissionService } from '../../authentication/helpers/permission-service.js'
import { redirectToClientPage } from '../../authentication/helpers/redirects/redirect-to-client-page.js'
import { APP_PATH } from '../../constants.js'
import { ErrorView } from '../../error/views/ErrorView.js'
import { InteractiveTour } from '../../shared/components/InteractiveTour/InteractiveTour.js'
import { buildLink } from '../../shared/helpers/build-link.js'
import { tHtml } from '../../shared/helpers/translate-html.js'
import { tText } from '../../shared/helpers/translate-text.js'
import { ToastService } from '../../shared/services/toast-service.js'
import { getPageNotFoundError } from '../../shared/translations/page-not-found.js'
import { Account } from '../components/Account.js'
import { Email } from '../components/Email/Email.js'
import { LinkedAccounts } from '../components/LinkedAccounts.js'
import { Notifications } from '../components/Notifications.js'
import { Profile } from '../components/Profile.js'
import {
  ACCOUNT_ID,
  EMAIL_ID,
  LINKED_ACCOUNTS,
  NOTIFICATIONS_ID,
  PROFILE_ID,
  type SettingsTab,
} from '../settings.const.js'

export const Settings: FC = () => {
  const navigateFunc = useNavigate()
  const { tabId } = useParams<{ tabId: string }>()
  const commonUser = useAtomValue(commonUserAtom)

  const [activeTab, setActiveTab] = useState<SettingsTab>(
    (tabId as SettingsTab) || PROFILE_ID,
  )

  const isPupil = [
    SpecialUserGroupId.PupilSecondary,
    SpecialUserGroupId.PupilElementary,
  ]
    .map(String)
    .includes(String(commonUser?.userGroup?.id))

  const generateTabHeader = (id: SettingsTab, label: string) => ({
    id,
    label,
    active: activeTab === id,
    onClick: () => setActiveTab(id),
  })

  const getTabHeaders = () => {
    const tabHeaders = [
      generateTabHeader(PROFILE_ID, tText('settings/views/settings___profiel')),
    ]

    // Only pupils with an archief account can view the account tab
    if (!isPupil || !!(commonUser?.idps || {})['HETARCHIEF']) {
      tabHeaders.push(
        generateTabHeader(
          ACCOUNT_ID,
          tText('settings/views/settings___account'),
        ),
      )
    }

    tabHeaders.push(
      generateTabHeader(
        LINKED_ACCOUNTS,
        tText('settings/views/settings___koppelingen'),
      ),
    )

    if (
      PermissionService.hasPerm(
        commonUser,
        PermissionName.VIEW_NEWSLETTERS_PAGE,
      )
    ) {
      tabHeaders.push(
        generateTabHeader(
          EMAIL_ID,
          tText('settings/views/settings___e-mail-voorkeuren'),
        ),
      )
    }
    if (
      PermissionService.hasPerm(
        commonUser,
        PermissionName.VIEW_NOTIFICATIONS_PAGE,
      )
    ) {
      generateTabHeader(
        NOTIFICATIONS_ID,
        tText('settings/views/settings___notifications'),
      )
    }

    return tabHeaders
  }

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
    [LINKED_ACCOUNTS]: {
      component: <LinkedAccounts />,
    },
  }

  const goToTab = (tabId: string | ReactText) => {
    redirectToClientPage(
      buildLink(APP_PATH.SETTINGS_TAB.route, { tabId }),
      navigateFunc,
    )
    setActiveTab(tabId as SettingsTab)
  }

  const getActiveTabComponent = (): ReactElement | null => {
    let tab = tabContents[activeTab]
    if (!tab) {
      ToastService.danger(
        tHtml(
          'settings/views/settings___het-instellingen-tab-active-tab-bestaat-niet',
          {
            activeTab,
          },
        ),
      )
      tab = tabContents[PROFILE_ID]
    }
    return tab.component
  }

  const viewNewsletterPage = PermissionService.hasPerm(
    commonUser,
    PermissionName.VIEW_NEWSLETTERS_PAGE,
  )
  const viewNotificationsPage = PermissionService.hasPerm(
    commonUser,
    PermissionName.VIEW_NOTIFICATIONS_PAGE,
  )
  if (
    !Object.keys(tabContents).includes(activeTab) ||
    (activeTab === EMAIL_ID && !viewNewsletterPage) ||
    (activeTab === NOTIFICATIONS_ID && !viewNotificationsPage)
  ) {
    return (
      <ErrorView
        message={getPageNotFoundError(!!commonUser)}
        icon={IconName.search}
        actionButtons={['home', 'helpdesk']}
      />
    )
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
  )
}

export default Settings
