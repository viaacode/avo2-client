import { BlockHeading } from '@meemoo/admin-core-ui/client';
import {
  Button,
  Container,
  DropdownButton,
  DropdownContent,
  Form,
  FormGroup,
  Icon,
  IconName,
  MenuContent,
  Navbar,
  Pill,
  PillVariants,
  Select,
  type SelectOption,
  Spacer,
  Tabs,
  Toolbar,
  ToolbarLeft,
  ToolbarRight,
} from '@viaa/avo2-components';
import { PermissionName } from '@viaa/avo2-types';
import { compact } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
import { useAtomValue } from 'jotai';
import {
  type FC,
  type ReactText,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router';
import { useLocation } from 'react-router-dom';

import { AssignmentOverview } from '../../assignment/views/AssignmentOverview';
import { commonUserAtom } from '../../authentication/authentication.store';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects/redirects';
import { CollectionOrBundle } from '../../collection/collection.types';
import { CollectionOrBundleOverview } from '../../collection/components/CollectionOrBundleOverview';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { EmbedCodeOverview } from '../../embed-code/components/EmbedCodeOverview';
import { ControlledDropdown } from '../../shared/components/ControlledDropdown/ControlledDropdown';
import { InteractiveTour } from '../../shared/components/InteractiveTour/InteractiveTour';
import {
  LoadingErrorLoadedComponent,
  type LoadingInfo,
} from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { buildLink } from '../../shared/helpers/build-link';
import { navigate } from '../../shared/helpers/link';
import { renderMobileDesktop } from '../../shared/helpers/renderMobileDesktop';
import { useGetWorkspaceCounts } from '../hooks/useGetWorkspaceCounts';
import {
  ASSIGNMENTS_ID,
  BOOKMARKS_ID,
  BUNDLES_ID,
  COLLECTIONS_ID,
  EMBEDS_ID,
  GET_TABS,
  ORGANISATION_CONTENT_ID,
  QUICK_LANE_ID,
  WORKSPACE_TAB_ID_TO_COUNT_ID,
} from '../workspace.const';
import {
  type NavTab,
  type TabFilter,
  type TabView,
  type TabViewMap,
} from '../workspace.types';

import { BookmarksOverview } from './BookmarksOverview';
import { OrganisationContentOverview } from './OrganisationContentOverview';
import { QuickLaneOverview } from './QuickLaneOverview';

import './Workspace.scss';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';

interface WorkspacePermissions {
  canViewOwnCollections?: boolean;
  canViewOwnBundles?: boolean;
  canCreateAssignments?: boolean;
  canViewAssignments?: boolean;
  canCreateBookmarks?: boolean;
  canViewContentInSameCompany?: boolean;
  canViewSomeQuickLanes?: boolean;
  canEmbedItemsOnOtherSites?: boolean;
}

export const Workspace: FC = () => {
  const location = useLocation();
  const navigateFunc = useNavigate();
  const { tabId: tabIdFromUrl } = useParams<{ tabId: string }>();

  const commonUser = useAtomValue(commonUserAtom);
  // State
  const [activeFilter, setActiveFilter] = useState<ReactText>();
  const [tabId, setTabId] = useState<string | null>(null);
  const [tabs, setTabs] = useState<TabViewMap>({});
  const [permissions, setPermissions] = useState<WorkspacePermissions>({});
  const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({
    state: 'loading',
  });
  const { data: workspaceCounts, refetch: refetchWorkspaceCounts } =
    useGetWorkspaceCounts();

  // Methods
  // react to route changes by navigating back wih the browser history back button
  useEffect(() => {
    if (tabIdFromUrl) {
      setTabId(tabIdFromUrl);
    }
  }, [tabIdFromUrl]);

  const updatePermissions = useCallback(() => {
    Promise.all([
      PermissionService.hasPermission(
        PermissionName.VIEW_OWN_COLLECTIONS,
        null,
        commonUser,
      ),
      PermissionService.hasPermission(
        PermissionName.VIEW_OWN_BUNDLES,
        null,
        commonUser,
      ),
      PermissionService.hasPermission(
        PermissionName.CREATE_ASSIGNMENTS,
        null,
        commonUser,
      ),
      PermissionService.hasPermission(
        PermissionName.VIEW_ASSIGNMENTS,
        null,
        commonUser,
      ),
      PermissionService.hasPermission(
        PermissionName.CREATE_BOOKMARKS,
        null,
        commonUser,
      ),
      PermissionService.hasPermission(
        PermissionName.VIEW_CONTENT_IN_SAME_COMPANY,
        null,
        commonUser,
      ),
      PermissionService.hasAtLeastOnePerm(commonUser, [
        PermissionName.VIEW_PERSONAL_QUICK_LANE_OVERVIEW,
        PermissionName.VIEW_OWN_ORGANISATION_QUICK_LANE_OVERVIEW,
      ]),
      PermissionService.hasPermission(
        PermissionName.EMBED_ITEMS_ON_OTHER_SITES,
        null,
        commonUser,
      ),
    ])
      .then((response) => {
        setPermissions({
          canViewOwnCollections: response[0],
          canViewOwnBundles: response[1],
          canCreateAssignments: response[2],
          canViewAssignments: response[3],
          canCreateBookmarks: response[4],
          canViewContentInSameCompany: response[5],
          canViewSomeQuickLanes: response[6],
          canEmbedItemsOnOtherSites: response[7],
        });
      })
      .catch((err) => {
        console.error(
          'Failed to check permissions for workspace overview page',
          err,
          {
            commonUser,
          },
        );
        setLoadingInfo({
          state: 'error',
          message: tHtml(
            'workspace/views/workspace___het-laden-van-de-werkruimte-is-mislukt',
          ),
        });
      });
  }, [commonUser]);

  // Make map for available tab views
  useEffect(() => {
    const empty = { component: null };

    setTabs({
      [COLLECTIONS_ID]: permissions.canViewOwnCollections
        ? {
            component: (
              <CollectionOrBundleOverview
                type={CollectionOrBundle.COLLECTION}
                onUpdate={() => {
                  refetchWorkspaceCounts();
                }}
              />
            ),
          }
        : empty,
      [BUNDLES_ID]: permissions.canViewOwnBundles
        ? {
            component: (
              <CollectionOrBundleOverview
                type={CollectionOrBundle.BUNDLE}
                onUpdate={() => {
                  refetchWorkspaceCounts();
                }}
              />
            ),
          }
        : empty,
      [ASSIGNMENTS_ID]:
        permissions.canViewAssignments || permissions.canCreateAssignments
          ? {
              component: (
                <AssignmentOverview
                  onUpdate={() => {
                    refetchWorkspaceCounts();
                  }}
                />
              ),
            }
          : empty,
      [BOOKMARKS_ID]: permissions.canCreateBookmarks
        ? {
            component: (
              <BookmarksOverview
                onUpdate={() => {
                  refetchWorkspaceCounts();
                }}
                numberOfItems={workspaceCounts?.bookmarks || 0}
              />
            ),
          }
        : empty,
      [ORGANISATION_CONTENT_ID]: permissions.canViewContentInSameCompany
        ? {
            component: (
              <OrganisationContentOverview
                onUpdate={() => {
                  refetchWorkspaceCounts();
                }}
                numberOfItems={workspaceCounts?.organisationContent || 0}
              />
            ),
          }
        : empty,
      [QUICK_LANE_ID]: permissions.canViewSomeQuickLanes
        ? {
            component: (
              <QuickLaneOverview
                numberOfItems={workspaceCounts?.quickLanes || 0}
              />
            ),
          }
        : empty,
      [EMBEDS_ID]: permissions.canEmbedItemsOnOtherSites
        ? {
            component: (
              <EmbedCodeOverview
                onUpdate={() => {
                  refetchWorkspaceCounts();
                }}
                numberOfItems={workspaceCounts?.embeds || 0}
              />
            ),
          }
        : empty,
    });
  }, [
    workspaceCounts,
    permissions,
    location,
    commonUser,
    updatePermissions,
    refetchWorkspaceCounts,
  ]);

  const goToTab = useCallback(
    (id: ReactText) => {
      navigate(
        navigateFunc,
        APP_PATH.WORKSPACE_TAB.route,
        { tabId: id },
        undefined,
        'replace',
      );
      setTabId(String(id));
    },
    [navigateFunc, setTabId],
  );

  const getFirstRenderableTab = useCallback(() => {
    return Object.values(tabs).findIndex((tab) => tab.component !== null);
  }, [tabs]);

  // If no active tab is specified, navigate to the first renderable tab
  useEffect(() => {
    if (tabId === null) {
      const first = Object.keys(tabs)[getFirstRenderableTab()];
      first && goToTab(first);
    }
  }, [tabs, tabId, goToTab, getFirstRenderableTab]);

  const getActiveTab = useCallback(() => {
    return tabs[tabId || getFirstRenderableTab() || 0];
  }, [tabs, tabId, getFirstRenderableTab]);

  useEffect(() => {
    updatePermissions();
  }, [updatePermissions]);

  useEffect(() => {
    if (!isEmpty(permissions) && !isEmpty(tabs)) {
      if (getActiveTab()) {
        // Use has access to at least one tab
        setLoadingInfo({
          state: 'loaded',
        });
      } else {
        setLoadingInfo({
          state: 'error',
          message: tHtml(
            'workspace/views/workspace___je-hebt-geen-rechten-om-je-werkruimte-te-bekijken',
          ),
          icon: IconName.lock,
        });
      }
    }
  }, [setLoadingInfo, getActiveTab, permissions, tabs]);

  const getNavTabs = useCallback(() => {
    return compact(
      GET_TABS().map((tab) => {
        if (tabs[tab.id].component) {
          const isTabActive = (tabId || Object.keys(tabs)[0]) === tab.id;
          return {
            ...tab,
            active: isTabActive,
            label: workspaceCounts?.[WORKSPACE_TAB_ID_TO_COUNT_ID[tab.id]] ? (
              <>
                {tab.label}
                <Pill variants={isTabActive ? [PillVariants.active] : []}>
                  {workspaceCounts[WORKSPACE_TAB_ID_TO_COUNT_ID[tab.id]]}
                </Pill>
              </>
            ) : (
              tab.label
            ),
          };
        }
        return null;
      }),
    );
  }, [tabs, tabId, workspaceCounts]);

  const handleMenuContentClick = (menuItemId: ReactText) =>
    setActiveFilter(menuItemId);

  const handleCreateNewAssignmentClick = () => {
    redirectToClientPage(
      buildLink(APP_PATH.ASSIGNMENT_CREATE.route),
      navigateFunc,
    );
  };

  // Render
  const renderFilter = (filter: TabFilter) => {
    const currentFilter = filter.options.find(
      (f) => f.id === (activeFilter || filter.options[0].id),
    );

    return (
      <Form type="inline">
        <FormGroup label={filter.label}>
          <ControlledDropdown isOpen={false} placement="bottom-end">
            <DropdownButton>
              <div className="c-filter-dropdown c-filter-dropdown--no-bg">
                <div className="c-filter-dropdown__label">
                  {currentFilter
                    ? currentFilter.label
                    : filter.options[0].label}
                </div>
                <div className="c-filter-dropdown__options">
                  <Icon name={IconName.caretDown} />
                </div>
              </div>
            </DropdownButton>
            <DropdownContent>
              <MenuContent
                menuItems={filter.options}
                onClick={handleMenuContentClick}
              />
            </DropdownContent>
          </ControlledDropdown>
        </FormGroup>
      </Form>
    );
  };

  const renderMobileTabs = (tabs: NavTab[]) => {
    return (
      <Spacer margin="bottom">
        <Select
          options={tabs.map(
            (tab: NavTab): SelectOption<string> => ({
              label: tab.label,
              value: tab.id.toString(),
            }),
          )}
          value={tabId || Object.keys(tabs)[0]}
          onChange={goToTab}
          className="c-tab-select"
        />
      </Spacer>
    );
  };

  const renderNavTabs = (tabs: NavTab[]) => {
    return renderMobileDesktop({
      mobile: renderMobileTabs(tabs),
      desktop: <Tabs tabs={tabs} onClick={goToTab} />,
    });
  };

  const renderToolbar = (tabs: NavTab[], activeTab: TabView) => {
    const filter = activeTab?.filter || null;

    return filter ? (
      <Toolbar autoHeight>
        {tabs.length > 1 && <ToolbarLeft>{renderNavTabs(tabs)}</ToolbarLeft>}
        <ToolbarRight>
          <span>{renderFilter(filter)}</span>
        </ToolbarRight>
      </Toolbar>
    ) : (
      tabs.length > 1 && renderNavTabs(tabs)
    );
  };

  const renderActionButton = (activeTabName: string) => {
    switch (activeTabName) {
      case ASSIGNMENTS_ID:
        return (
          permissions.canCreateAssignments && (
            <Button
              type="primary"
              label={tText('workspace/views/workspace___nieuwe-opdracht')}
              onClick={handleCreateNewAssignmentClick}
              title={tText(
                'workspace/views/workspace___maak-een-opdracht-voor-je-leerlingen',
              )}
            />
          )
        );

      default:
        break;
    }
  };

  const renderTabsAndContent = () => {
    const tabs = getNavTabs() as NavTab[];
    const activeTab: TabView = getActiveTab();

    return (
      <div className="m-workspace">
        <Container background="alt" mode="vertical" size="small">
          <Container mode="horizontal">
            <Toolbar>
              <ToolbarLeft>
                <BlockHeading type="h2" className="u-m-0">
                  {tHtml('workspace/views/workspace___mijn-werkruimte')}
                </BlockHeading>
              </ToolbarLeft>

              <ToolbarRight>
                <InteractiveTour showButton />
                {tabId && renderActionButton(tabId)}
              </ToolbarRight>
            </Toolbar>
          </Container>
        </Container>

        <Navbar
          background="alt"
          placement="top"
          autoHeight
          className="c-scrollable"
        >
          <Container mode="horizontal">
            <Toolbar className="c-toolbar--no-height">
              <ToolbarLeft>{renderToolbar(tabs, activeTab)}</ToolbarLeft>
            </Toolbar>
          </Container>
        </Navbar>

        <Container mode="vertical" size="small">
          <Container mode="horizontal">{activeTab.component}</Container>
        </Container>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>
          {GENERATE_SITE_TITLE(
            tText('workspace/views/workspace___mijn-werkruimte-pagina-titel'),
          )}
        </title>
        <meta
          name="description"
          content={tText(
            'workspace/views/workspace___mijn-werkruimte-pagina-beschrijving',
          )}
        />
      </Helmet>
      <LoadingErrorLoadedComponent
        loadingInfo={loadingInfo}
        render={renderTabsAndContent}
        dataObject={permissions}
        showSpinner
        locationId="workspace"
      />
    </>
  );
};

export default Workspace;
