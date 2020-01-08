import { get, isEmpty } from 'lodash-es';
import React, { FunctionComponent, ReactText, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	Container,
	DropdownButton,
	DropdownContent,
	Form,
	FormGroup,
	Heading,
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
import { CollectionOverview } from '../../collection/views';
import { ControlledDropdown, LoadingErrorLoadedComponent } from '../../shared/components';
import { navigate } from '../../shared/helpers';

import { PERMISSIONS, PermissionService } from '../../authentication/helpers/permission-service';
import { LoadingInfo } from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { dataService } from '../../shared/services/data-service';

import {
	ASSIGNMENTS_ID,
	BOOKMARKS_ID,
	COLLECTIONS_ID,
	FOLDERS_ID,
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
	const [tabId, setTabId] = useState<string | null>(match.params.tabId);
	const [tabCounts, setTabCounts] = useState<{ [tabId: string]: number }>({});
	const [permissions, setPermissions] = useState<{ [tabId: string]: boolean }>({});
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	// Methods
	const goToTab = (id: ReactText) => {
		navigate(history, WORKSPACE_PATH.WORKSPACE_TAB, { tabId: id });
		setTabId(String(id));
	};

	const isWorkspaceOverview = (): boolean => {
		return !(tabId || '').includes('/');
	};

	useEffect(() => {
		Promise.all([
			dataService.query({
				query: GET_WORKSPACE_TAB_COUNTS,
				variables: { owner_profile_id: getProfileId(user) },
			}),
			PermissionService.hasPermission(PERMISSIONS.CREATE_COLLECTIONS, null, user),
			PermissionService.hasPermission(PERMISSIONS.CREATE_BUNDLES, null, user),
			PermissionService.hasPermission(PERMISSIONS.CREATE_ASSIGNMENTS, null, user),
			PermissionService.hasPermission(PERMISSIONS.CREATE_BOOKMARKS, null, user),
		])
			.then(response => {
				setTabCounts({
					[COLLECTIONS_ID]: get(response[0], 'data.app_collections_aggregate.aggregate.count'),
					[FOLDERS_ID]: 0, // TODO: get from database once the table exists
					[ASSIGNMENTS_ID]: get(response[0], 'data.app_assignments_aggregate.aggregate.count'),
					[BOOKMARKS_ID]: 0, // TODO: get from database once the table exists
				});
				setPermissions({
					[COLLECTIONS_ID]: response[1],
					[FOLDERS_ID]: response[2],
					[ASSIGNMENTS_ID]: response[3],
					[BOOKMARKS_ID]: response[4],
				});

				if (getActiveTab()) {
					// Use has access to at least one tab
					setLoadingInfo({
						state: 'loaded',
					});
				} else {
					setLoadingInfo({
						state: 'error',
						message: t('Je hebt geen rechten om je werkruimte te bekijken'),
						icon: 'lock',
					});
				}
			})
			.catch(err => {
				console.error(
					'Failed to check permissions or get tab counts for workspace overview page',
					err,
					{ user }
				);
				setLoadingInfo({
					state: 'error',
					message: t('Het laden van de werkruimte is mislukt'),
				});
			});
	}, [user, t]);

	const addTabIfUserHasPerm = (tabId: string, obj: any): any => {
		if (permissions[tabId]) {
			return { [tabId]: obj };
		} else {
			return {};
		}
	};

	// Make map for available tab views
	const getTabs = (): TabViewMap => {
		return {
			...addTabIfUserHasPerm(COLLECTIONS_ID, {
				component: () => (
					<CollectionOverview
						numberOfCollections={tabCounts[COLLECTIONS_ID]}
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
			...addTabIfUserHasPerm(FOLDERS_ID, {
				component: () => <span>TODO Mappen</span>,
				filter: {
					label: t('Filter op label'),
					options: [{ id: 'all', label: t('Alle') }],
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
		};
	};

	// Get active tab based on above map with tabId
	const tabs = getTabs();
	const getActiveTab = () => getTabs()[tabId || Object.keys(tabs)[0]];
	const getNavTabs = () => {
		return TABS.map(t => ({
			...t,
			active: tabId === t.id,
			label: tabCounts[t.id] ? `${t.label} (${tabCounts[t.id]})` : t.label,
		}));
	};

	const handleMenuContentClick = (menuItemId: ReactText) => setActiveFilter(menuItemId);

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
						<Heading type="h2" className="u-m-0">
							<Trans i18nKey="workspace/views/workspace___mijn-werkruimte">Mijn Werkruimte</Trans>
						</Heading>
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
