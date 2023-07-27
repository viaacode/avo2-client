import { BlockHeading } from '@meemoo/admin-core-ui';
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
	SelectOption,
	Spacer,
	Tabs,
	Toolbar,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { PermissionName } from '@viaa/avo2-types';
import type { Avo } from '@viaa/avo2-types';
import { compact, get, isEmpty } from 'lodash-es';
import React, { FunctionComponent, ReactText, useCallback, useEffect, useState } from 'react';
import MetaTags from 'react-meta-tags';

import { AssignmentOverview } from '../../assignment/views';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { getProfileId } from '../../authentication/helpers/get-profile-id';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import CollectionOrBundleOverview from '../../collection/components/CollectionOrBundleOverview';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import {
	ControlledDropdown,
	InteractiveTour,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../shared/components';
import {
	GetWorkspaceTabCountsDocument,
	GetWorkspaceTabCountsQuery,
	GetWorkspaceTabCountsQueryVariables,
} from '../../shared/generated/graphql-db-types';
import { buildLink, isMobileWidth, navigate } from '../../shared/helpers';
import useTranslation from '../../shared/hooks/useTranslation';
import { dataService } from '../../shared/services/data-service';
import {
	ASSIGNMENTS_ID,
	BOOKMARKS_ID,
	BUNDLES_ID,
	COLLECTIONS_ID,
	GET_TABS,
	ORGANISATION_CONTENT_ID,
	QUICK_LANE_ID,
} from '../workspace.const';
import { NavTab, TabFilter, TabView, TabViewMap } from '../workspace.types';

import BookmarksOverview from './BookmarksOverview';
import OrganisationContentOverview from './OrganisationContentOverview';
import QuickLaneOverview from './QuickLaneOverview';

import './Workspace.scss';

export interface WorkspaceProps extends DefaultSecureRouteProps<{ tabId: string }> {
	collections: Avo.Collection.Collection | null;
}

// Using `hasAtLeastOnePerm` to avoid async
const getQuickLaneCount = (user: Avo.User.User, response: GetWorkspaceTabCountsQuery): number => {
	// Show count of personal quick lane
	if (
		PermissionService.hasAtLeastOnePerm(user, [
			PermissionName.VIEW_PERSONAL_QUICK_LANE_OVERVIEW,
		])
	) {
		return response.app_quick_lane_counts.aggregate?.count || 0;
	}

	if (
		PermissionService.hasAtLeastOnePerm(user, [
			PermissionName.VIEW_OWN_ORGANISATION_QUICK_LANE_OVERVIEW,
		])
	) {
		return response.app_quick_lane_organisation_counts.aggregate?.count || 0;
	}

	return 0;
};

interface WorkspacePermissions {
	canViewOwnCollections?: boolean;
	canViewOwnBundles?: boolean;
	canCreateAssignments?: boolean;
	canViewAssignments?: boolean;
	canCreateBookmarks?: boolean;
	canViewContentInSameCompany?: boolean;
	canViewSomeQuickLanes?: boolean;
}

const Workspace: FunctionComponent<WorkspaceProps> = ({ history, match, location, user }) => {
	const { tText, tHtml } = useTranslation();

	// State
	const [activeFilter, setActiveFilter] = useState<ReactText>();
	const [tabId, setTabId] = useState<string | null>(null);
	const [tabs, setTabs] = useState<TabViewMap>({});
	const [tabCounts, setTabCounts] = useState<{ [tabId: string]: number }>({});
	const [permissions, setPermissions] = useState<WorkspacePermissions>({});
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	// Methods
	// react to route changes by navigating back wih the browser history back button
	useEffect(() => {
		const param = match.params.tabId;
		param && setTabId(param);
	}, [match.params.tabId]);

	const updatePermissionsAndCounts = useCallback(() => {
		Promise.all([
			dataService.query<GetWorkspaceTabCountsQuery, GetWorkspaceTabCountsQueryVariables>({
				query: GetWorkspaceTabCountsDocument,
				variables: {
					owner_profile_id: getProfileId(user),
					company_id: get(user, 'profile.company_id') || 'EMPTY',
					now: new Date().toISOString(),
				},
			}),
			PermissionService.hasPermission(PermissionName.VIEW_OWN_COLLECTIONS, null, user),
			PermissionService.hasPermission(PermissionName.VIEW_OWN_BUNDLES, null, user),
			PermissionService.hasPermission(PermissionName.CREATE_ASSIGNMENTS, null, user),
			PermissionService.hasPermission(PermissionName.VIEW_ASSIGNMENTS, null, user),
			PermissionService.hasPermission(PermissionName.CREATE_BOOKMARKS, null, user),
			PermissionService.hasPermission(
				PermissionName.VIEW_CONTENT_IN_SAME_COMPANY,
				null,
				user
			),
			PermissionService.hasAtLeastOnePerm(user, [
				PermissionName.VIEW_PERSONAL_QUICK_LANE_OVERVIEW,
				PermissionName.VIEW_OWN_ORGANISATION_QUICK_LANE_OVERVIEW,
			]),
		])
			.then((response) => {
				console.log(response);
				setTabCounts({
					[COLLECTIONS_ID]: response[0].collection_counts.aggregate?.count ?? 0,
					[BUNDLES_ID]: response[0].bundle_counts.aggregate?.count ?? 0,
					[ASSIGNMENTS_ID]: response[0].assignment_counts.aggregate?.count ?? 0,
					[BOOKMARKS_ID]:
						(response[0].item_bookmark_counts.aggregate?.count ?? 0) +
						(response[0].collection_bookmark_counts.aggregate?.count ?? 0) +
						(response[0].assignment_bookmark_counts.aggregate?.count ?? 0),
					[ORGANISATION_CONTENT_ID]:
						response[0].organisation_content_counts.aggregate?.count ?? 0,
					[QUICK_LANE_ID]: getQuickLaneCount(user, response[0]),
				});
				setPermissions({
					canViewOwnCollections: response[1],
					canViewOwnBundles: response[2],
					canCreateAssignments: response[3],
					canViewAssignments: response[4],
					canCreateBookmarks: response[5],
					canViewContentInSameCompany: response[6],
					canViewSomeQuickLanes: response[7],
				});
			})
			.catch((err) => {
				console.error(
					'Failed to check permissions or get tab counts for workspace overview page',
					err,
					{ user }
				);
				setLoadingInfo({
					state: 'error',
					message: tHtml(
						'workspace/views/workspace___het-laden-van-de-werkruimte-is-mislukt'
					),
				});
			});
	}, [user, tText, setPermissions]);

	// Make map for available tab views
	useEffect(() => {
		const empty = { component: null };

		setTabs({
			[COLLECTIONS_ID]: permissions.canViewOwnCollections
				? {
						component: (
							<CollectionOrBundleOverview
								numberOfItems={tabCounts[COLLECTIONS_ID]}
								type="collection"
								onUpdate={updatePermissionsAndCounts}
								history={history}
								location={location}
								match={match}
								user={user}
							/>
						),
				  }
				: empty,
			[BUNDLES_ID]: permissions.canViewOwnBundles
				? {
						component: (
							<CollectionOrBundleOverview
								numberOfItems={tabCounts[BUNDLES_ID]}
								type="bundle"
								onUpdate={updatePermissionsAndCounts}
								history={history}
								location={location}
								match={match}
								user={user}
							/>
						),
				  }
				: empty,
			[ASSIGNMENTS_ID]:
				permissions.canViewAssignments || permissions.canCreateAssignments
					? {
							component: (
								<AssignmentOverview
									onUpdate={updatePermissionsAndCounts}
									history={history}
									location={location}
									match={match}
									user={user}
								/>
							),
					  }
					: empty,
			[BOOKMARKS_ID]: permissions.canCreateBookmarks
				? {
						component: (
							<BookmarksOverview
								onUpdate={updatePermissionsAndCounts}
								history={history}
								location={location}
								match={match}
								user={user}
								numberOfItems={tabCounts[BOOKMARKS_ID]}
							/>
						),
				  }
				: empty,
			[ORGANISATION_CONTENT_ID]: permissions.canViewContentInSameCompany
				? {
						component: (
							<OrganisationContentOverview
								onUpdate={updatePermissionsAndCounts}
								history={history}
								location={location}
								match={match}
								user={user}
								numberOfItems={tabCounts[ORGANISATION_CONTENT_ID]}
							/>
						),
				  }
				: empty,
			[QUICK_LANE_ID]: permissions.canViewSomeQuickLanes
				? {
						component: (
							<QuickLaneOverview
								history={history}
								location={location}
								match={match}
								user={user}
								numberOfItems={tabCounts[QUICK_LANE_ID]}
							/>
						),
				  }
				: empty,
		});
	}, [tabCounts, permissions, tText, history, location, match, user, updatePermissionsAndCounts]);

	const goToTab = useCallback(
		(id: ReactText) => {
			navigate(history, APP_PATH.WORKSPACE_TAB.route, { tabId: id }, undefined, 'replace');
			setTabId(String(id));
		},
		[history, setTabId]
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
		updatePermissionsAndCounts();
	}, [updatePermissionsAndCounts]);

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
						'workspace/views/workspace___je-hebt-geen-rechten-om-je-werkruimte-te-bekijken'
					),
					icon: IconName.lock,
				});
			}
		}
	}, [setLoadingInfo, getActiveTab, tText, permissions, tabs]);

	const getNavTabs = useCallback(() => {
		return compact(
			GET_TABS().map((tab) => {
				if (tabs[tab.id].component) {
					const isTabActive = (tabId || Object.keys(tabs)[0]) === tab.id;
					return {
						...tab,
						active: isTabActive,
						label: tabCounts[tab.id] ? (
							<>
								{tab.label}
								<Pill variants={isTabActive ? [PillVariants.active] : []}>
									{tabCounts[tab.id]}
								</Pill>
							</>
						) : (
							tab.label
						),
					};
				}
				return null;
			})
		);
	}, [tabs, tabId, tabCounts]);

	const handleMenuContentClick = (menuItemId: ReactText) => setActiveFilter(menuItemId);

	const handleCreateNewAssignmentClick = () => {
		redirectToClientPage(buildLink(APP_PATH.ASSIGNMENT_CREATE.route), history);
	};

	// Render
	const renderFilter = (filter: TabFilter) => {
		const currentFilter = filter.options.find(
			(f) => f.id === (activeFilter || filter.options[0].id)
		);

		return (
			<Form type="inline">
				<FormGroup label={filter.label}>
					<ControlledDropdown isOpen={false} placement="bottom-end">
						<DropdownButton>
							<div className="c-filter-dropdown c-filter-dropdown--no-bg">
								<div className="c-filter-dropdown__label">
									{currentFilter ? currentFilter.label : filter.options[0].label}
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
						})
					)}
					value={tabId || Object.keys(tabs)[0]}
					onChange={goToTab}
					className="c-tab-select"
				/>
			</Spacer>
		);
	};

	const renderNavTabs = (tabs: NavTab[]) => {
		return isMobileWidth() ? renderMobileTabs(tabs) : <Tabs tabs={tabs} onClick={goToTab} />;
	};

	const renderToolbar = (tabs: NavTab[], activeTab: TabView) => {
		const filter = get(activeTab, 'filter', null);

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
								'workspace/views/workspace___maak-een-opdracht-voor-je-leerlingen'
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

							{tabId && <ToolbarRight>{renderActionButton(tabId)}</ToolbarRight>}
						</Toolbar>
					</Container>
				</Container>

				<Navbar background="alt" placement="top" autoHeight>
					<Container mode="horizontal">
						<Toolbar className="c-toolbar--no-height">
							<ToolbarLeft>{renderToolbar(tabs, activeTab)}</ToolbarLeft>

							<ToolbarRight>
								<InteractiveTour showButton />
							</ToolbarRight>
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
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						tText('workspace/views/workspace___mijn-werkruimte-pagina-titel')
					)}
				</title>
				<meta
					name="description"
					content={tText(
						'workspace/views/workspace___mijn-werkruimte-pagina-beschrijving'
					)}
				/>
			</MetaTags>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				render={renderTabsAndContent}
				dataObject={permissions}
				showSpinner
			/>
		</>
	);
};

export default Workspace;
