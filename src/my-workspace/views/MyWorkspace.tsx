import React, { FunctionComponent, ReactText, useState } from 'react';
import { withRouter } from 'react-router';

import { get } from 'lodash-es';

import {
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
import AssignmentOverview from '../../assignment/views/AssignmentOverview';
import CollectionOverview from '../../collection/views/CollectionOverview';
import { RouteParts } from '../../constants';
import ControlledDropdown from '../../shared/components/ControlledDropdown/ControlledDropdown';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import { ASSIGNMENTS_ID, BOOKMARKS_ID, COLLECTIONS_ID, FOLDERS_ID, TABS } from '../constants';
import { MyWorkspaceProps, TabViewMap } from '../types';
import Bookmarks from './Bookmarks';

import { GET_WORKSPACE_TAB_COUNTS } from '../workspace.gql';
import './MyWorkspace.scss';

const MyWorkspace: FunctionComponent<MyWorkspaceProps> = ({ history, match }) => {
	// State
	const [activeFilter, setActiveFilter] = useState<ReactText>();
	const [tabId, setTabId] = useState<string>(match.params.tabId || COLLECTIONS_ID);

	// Methods
	const goToTab = (id: ReactText) => {
		history.push(`/${RouteParts.MyWorkspace}/${id}`);
		setTabId(String(id));
	};

	// Make map for available tab views
	const getTabs = (counts: { [tabId: string]: number }): TabViewMap => {
		return {
			[COLLECTIONS_ID]: {
				component: <CollectionOverview numberOfCollections={counts[COLLECTIONS_ID]} />,
				// TODO: Vergeet deze filter niet terug te plaatsen.
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
				component: <span>TODO Mappen</span>,
				filter: {
					label: 'Filter op label',
					options: [{ id: 'all', label: 'Alle' }],
				},
			},
			[ASSIGNMENTS_ID]: {
				component: <AssignmentOverview />,
			},
			[BOOKMARKS_ID]: {
				component: <Bookmarks />,
			},
		};
	};
	// Get active tab based on above map with tabId
	const getActiveTab = (counts: { [tabId: string]: number }) => getTabs(counts)[tabId];
	const getNavTabs = (counts: { [tabId: string]: number }) => {
		return TABS.map(t => ({
			...t,
			active: tabId === t.id,
			label: counts[t.id] ? `${t.label} (${counts[t.id]})` : t.label,
		}));
	};

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
								<MenuContent
									menuItems={filter.options}
									onClick={filter => {
										setActiveFilter(filter);
									}}
								/>
							</DropdownContent>
						</ControlledDropdown>
					</FormGroup>
				</Form>
			);
		}
	};

	const renderTabsAndContent = (data: {
		app_collections_aggregate: { aggregate: { count: number } };
	}) => {
		const counts = {
			[COLLECTIONS_ID]: get(data, 'app_collections_aggregate.aggregate.count'),
			[FOLDERS_ID]: 0, // TODO get from database once the table exists
			[BOOKMARKS_ID]: 0, // TODO get from database once the table exists
		};
		return (
			<>
				<Container background="alt" mode="vertical" size="small">
					<Container mode="horizontal">
						<h2 className="c-h2 u-m-0">Mijn Werkruimte</h2>
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
					<Container mode="horizontal">{getActiveTab(counts).component}</Container>
				</Container>
			</>
		);
	};

	return tabId.includes('/') ? null : (
		<DataQueryComponent
			query={GET_WORKSPACE_TAB_COUNTS}
			// TODO: replace with actual owner id from ldap object
			variables={{ owner_profile_id: '260bb4ae-b120-4ae1-b13e-abe85ab575ba' }}
			renderData={renderTabsAndContent}
			notFoundMessage="Er zijn geen collecties gevonden"
		/>
	);
};

export default withRouter(MyWorkspace);
