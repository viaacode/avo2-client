import { get, isEmpty } from 'lodash-es';
import React, { FunctionComponent, ReactText, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	BlockHeading,
	Container,
	DropdownButton,
	DropdownContent,
	Form,
	FormGroup,
	Icon,
	MenuContent,
	Navbar,
	Tabs,
	Toolbar,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { AssignmentOverview } from '../../assignment/views';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { getProfileId } from '../../authentication/helpers/get-profile-info';
import { ControlledDropdown, LoadingErrorLoadedComponent } from '../../shared/components';
import { navigate } from '../../shared/helpers';

import {
	PermissionNames,
	PermissionService,
} from '../../authentication/helpers/permission-service';
import CollectionOrBundleOverview from '../../collection/components/CollectionOrBundleOverview';
import { LoadingInfo } from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { dataService } from '../../shared/services/data-service';

import {
	ASSIGNMENTS_ID,
	BOOKMARKS_ID,
	BUNDLES_ID,
	COLLECTIONS_ID,
	TABS,
	WORKSPACE_PATH,
} from '../workspace.const';
import { GET_WORKSPACE_TAB_COUNTS } from '../workspace.gql';
import { TabFilter, TabViewMap } from '../workspace.types';
import Bookmarks from './Bookmarks';
import './Workspace.scss';

export interface WorkspaceProps extends DefaultSecureRouteProps<{ tabId: string }> {
	collections: Avo.Collection.Collection | null;
}

const Workspace: FunctionComponent<WorkspaceProps> = ({ history, match, user, ...rest }) => {
	const [t] = useTranslation();

	// State
	const [activeFilter, setActiveFilter] = useState<ReactText>();
	const [tabId, setTabId] = useState<string | null>(match.params.tabId || null);
	const [tabs, setTabs] = useState<TabViewMap>({});
	const [tabCounts, setTabCounts] = useState<{ [tabId: string]: number }>({});
	const [permissions, setPermissions] = useState<{ [tabId: string]: boolean }>({});
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	// Methods
	// Make map for available tab views
	useEffect(() => {
		const addTabIfUserHasPerm = (tabId: string, obj: any): any => {
			if (permissions[tabId]) {
				return { [tabId]: obj };
			}
			return {};
		};
		setTabs({
			...addTabIfUserHasPerm(COLLECTIONS_ID, {
				component: () => (
					<CollectionOrBundleOverview
						numberOfItems={tabCounts[COLLECTIONS_ID]}
						type="collection"
						history={history}
						match={match}
						user={user}
						{...rest}
					/>
				),
				// TODO: DISABLED_FEATURE filter
				// filter: {
				// 	label: 'Auteur',
				// 	options: [
				// 		{ id: 'all', label: 'Alles' },
				// 		{ id: 'owner', label: 'Enkel waar ik eigenaar ben' },
				// 		{ id: 'sharedWith', label: 'Enkel gedeeld met mij' },
				// 		{ id: 'sharedBy', label: 'Enkel gedeeld door mij' },
				// 	],
				// },
			}),
			...addTabIfUserHasPerm(BUNDLES_ID, {
				component: () => (
					<CollectionOrBundleOverview
						numberOfItems={tabCounts[BUNDLES_ID]}
						type="bundle"
						history={history}
						match={match}
						user={user}
						{...rest}
					/>
				),
				filter: {
					label: t('workspace/views/workspace___filter-op-label'),
					options: [{ id: 'all', label: t('workspace/views/workspace___alle') }],
				},
			}),
			...addTabIfUserHasPerm(ASSIGNMENTS_ID, {
				component: () => (
					<AssignmentOverview history={history} match={match} user={user} {...rest} />
				),
			}),
			...addTabIfUserHasPerm(BOOKMARKS_ID, {
				component: () => <Bookmarks />,
			}),
		});
	}, [tabCounts, permissions]);

	const goToTab = (id: ReactText) => {
		navigate(history, WORKSPACE_PATH.WORKSPACE_TAB, { tabId: id });
		setTabId(String(id));
	};

	const getTabId = useCallback(() => {
		return tabId || Object.keys(tabs)[0];
	}, [tabs, tabId]);

	// Get active tab based on above map with tabId
	const getActiveTab = useCallback(() => {
		return tabs[getTabId()];
	}, [tabs, getTabId]);

	useEffect(() => {
		if (!isEmpty(permissions)) {
			return;
		}
		Promise.all([
			dataService.query({
				query: GET_WORKSPACE_TAB_COUNTS,
				variables: { owner_profile_id: getProfileId(user) },
			}),
			PermissionService.hasPermission(PermissionNames.CREATE_COLLECTIONS, null, user),
			PermissionService.hasPermission(PermissionNames.CREATE_BUNDLES, null, user),
			PermissionService.hasPermission(PermissionNames.CREATE_ASSIGNMENTS, null, user),
			PermissionService.hasPermission(PermissionNames.CREATE_BOOKMARKS, null, user),
		])
			.then(response => {
				setTabCounts({
					[COLLECTIONS_ID]: get(response[0], 'data.collection_counts.aggregate.count', 0),
					[BUNDLES_ID]: get(response[0], 'data.bundle_counts.aggregate.count', 0),
					[ASSIGNMENTS_ID]: get(response[0], 'data.assignment_counts.aggregate.count', 0),
					[BOOKMARKS_ID]:
						get(response[0], 'data.item_bookmark_counts.aggregate.count', 0) +
						get(response[0], 'data.collection_bookmark_counts.aggregate.count', 0),
				});
				setPermissions({
					[COLLECTIONS_ID]: response[1],
					[BUNDLES_ID]: response[2],
					[ASSIGNMENTS_ID]: response[3],
					[BOOKMARKS_ID]: response[4],
				});
			})
			.catch(err => {
				console.error(
					'Failed to check permissions or get tab counts for workspace overview page',
					err,
					{ user }
				);
				setLoadingInfo({
					state: 'error',
					message: t('workspace/views/workspace___het-laden-van-de-werkruimte-is-mislukt'),
				});
			});
	}, [user, t]);

	useEffect(() => {
		if (
			!isEmpty(permissions) &&
			!isEmpty(tabs) &&
			loadingInfo.state !== 'loaded' &&
			loadingInfo.state !== 'error'
		) {
			if (getActiveTab()) {
				// Use has access to at least one tab
				setLoadingInfo({
					state: 'loaded',
				});
			} else {
				setLoadingInfo({
					state: 'error',
					message: t(
						'workspace/views/workspace___je-hebt-geen-rechten-om-je-werkruimte-te-bekijken'
					),
					icon: 'lock',
				});
			}
		}
	}, [setLoadingInfo, getActiveTab, t]);

	useEffect(() => {
		if (!isEmpty(permissions) && !isEmpty(tabs) && loadingInfo.state === 'loading') {
			if (getActiveTab()) {
				// User has access to at least one tab
				setLoadingInfo({
					state: 'loaded',
				});
			} else {
				setLoadingInfo({
					state: 'error',
					message: t(
						'workspace/views/workspace___je-hebt-geen-rechten-om-je-werkruimte-te-bekijken'
					),
					icon: 'lock',
				});
			}
		}
	}, [getActiveTab, loadingInfo.state, permissions, t]);

	const getNavTabs = () => {
		return TABS.map(t => ({
			...t,
			active: getTabId() === t.id,
			label: tabCounts[t.id] ? `${t.label} (${tabCounts[t.id]})` : t.label,
		}));
	};

	const handleMenuContentClick = (menuItemId: ReactText) => setActiveFilter(menuItemId);

	// Render
	const renderFilter = () => {
		const filter: TabFilter | null = get(getActiveTab(), 'filter', null);

		if (filter) {
			if (!activeFilter) {
				setActiveFilter(filter.options[0].id);
			}

			const currentFilter = filter.options.find(f => f.id === activeFilter);

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
										<Icon name="caret-down" />
									</div>
								</div>
							</DropdownButton>
							<DropdownContent>
								<MenuContent menuItems={filter.options} onClick={handleMenuContentClick} />
							</DropdownContent>
						</ControlledDropdown>
					</FormGroup>
				</Form>
			);
		}
	};

	const renderTabsAndContent = () => {
		return (
			<>
				<Container background="alt" mode="vertical" size="small">
					<Container mode="horizontal">
						<BlockHeading type="h2" className="u-m-0">
							<Trans i18nKey="workspace/views/workspace___mijn-werkruimte">Mijn Werkruimte</Trans>
						</BlockHeading>
					</Container>
				</Container>

				<Navbar background="alt" placement="top" autoHeight>
					<Container mode="horizontal">
						<Toolbar autoHeight>
							<ToolbarLeft>
								<Tabs tabs={getNavTabs()} onClick={goToTab} />
							</ToolbarLeft>
							<ToolbarRight>
								<span>{renderFilter()}</span>
							</ToolbarRight>
						</Toolbar>
					</Container>
				</Navbar>

				<Container mode="vertical" size="small">
					<Container mode="horizontal">{getActiveTab().component()}</Container>
				</Container>
			</>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			render={renderTabsAndContent}
			dataObject={permissions}
			showSpinner
		/>
	);
};

export default Workspace;
