import { get } from 'lodash-es';
import React, { FunctionComponent, ReactText, useState } from 'react';

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
import { ControlledDropdown, DataQueryComponent } from '../../shared/components';
import { navigate } from '../../shared/helpers';

import {
	ASSIGNMENTS_ID,
	BOOKMARKS_ID,
	COLLECTIONS_ID,
	FOLDERS_ID,
	TABS,
	WORKSPACE_PATH,
} from '../workspace.const';
import { GET_WORKSPACE_TAB_COUNTS } from '../workspace.gql';
import { TabAggregates, TabViewMap } from '../workspace.types';
import Bookmarks from './Bookmarks';
import './Workspace.scss';

export interface WorkspaceProps extends DefaultSecureRouteProps<{ tabId: string }> {
	collections: Avo.Collection.Collection | null;
}

const Workspace: FunctionComponent<WorkspaceProps> = ({ history, match, user, ...rest }) => {
	// State
	const [activeFilter, setActiveFilter] = useState<ReactText>();
	const [tabId, setTabId] = useState<string>(match.params.tabId || COLLECTIONS_ID);

	// Methods
	const goToTab = (id: ReactText) => {
		navigate(history, WORKSPACE_PATH.WORKSPACE_TAB, { tabId: id });
		setTabId(String(id));
	};

	// Make map for available tab views
	const getTabs = (counts: { [tabId: string]: number }): TabViewMap => ({
		[COLLECTIONS_ID]: {
			component: (refetchCounts: () => void) => (
				<CollectionOverview
					numberOfCollections={counts[COLLECTIONS_ID]}
					refetchCount={refetchCounts}
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
		},
		[FOLDERS_ID]: {
			component: () => <span>TODO Mappen</span>,
			filter: {
				label: 'Filter op label',
				options: [{ id: 'all', label: 'Alle' }],
			},
		},
		[ASSIGNMENTS_ID]: {
			component: (refetchCounts: () => void) => (
				<AssignmentOverview
					refetchCount={refetchCounts}
					history={history}
					match={match}
					user={user}
					{...rest}
				/>
			),
		},
		[BOOKMARKS_ID]: {
			component: () => <Bookmarks />,
		},
	});

	// Get active tab based on above map with tabId
	const getActiveTab = (counts: { [tabId: string]: number }) => getTabs(counts)[tabId];
	const getNavTabs = (counts: { [tabId: string]: number }) => {
		return TABS.map(t => ({
			...t,
			active: tabId === t.id,
			label: counts[t.id] ? `${t.label} (${counts[t.id]})` : t.label,
		}));
	};

	const handleMenuContentClick = (menuItemId: ReactText) => setActiveFilter(menuItemId);

	const renderFilter = (counts: { [tabId: string]: number }) => {
		const filter = getActiveTab(counts).filter;

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

	const renderTabsAndContent = (data: TabAggregates, refetchCounts: () => void) => {
		const counts = {
			[COLLECTIONS_ID]: get(data, 'app_collections_aggregate.aggregate.count'),
			[FOLDERS_ID]: 0, // TODO: get from database once the table exists
			[ASSIGNMENTS_ID]: get(data, 'app_assignments_aggregate.aggregate.count'),
			[BOOKMARKS_ID]: 0, // TODO: get from database once the table exists
		};

		return (
			<>
				<Container background="alt" mode="vertical" size="small">
					<Container mode="horizontal">
						<Heading type="h2" className="u-m-0">
							Mijn Werkruimte
						</Heading>
					</Container>
				</Container>

				<Navbar background="alt" placement="top" autoHeight>
					<Container mode="horizontal">
						<Toolbar autoHeight>
							<ToolbarLeft>
								<Tabs tabs={getNavTabs(counts)} onClick={goToTab} />
							</ToolbarLeft>
							<ToolbarRight>
								<span>{renderFilter(counts)}</span>
							</ToolbarRight>
						</Toolbar>
					</Container>
				</Navbar>

				<Container mode="vertical" size="small">
					<Container mode="horizontal">{getActiveTab(counts).component(refetchCounts)}</Container>
				</Container>
			</>
		);
	};

	return tabId.includes('/') ? null : (
		<DataQueryComponent
			query={GET_WORKSPACE_TAB_COUNTS}
			variables={{ owner_profile_id: getProfileId(user) }}
			renderData={renderTabsAndContent}
			notFoundMessage="Er zijn geen collecties gevonden"
		/>
	);
};

export default Workspace;
