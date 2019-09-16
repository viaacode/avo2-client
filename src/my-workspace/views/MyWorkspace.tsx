import React, { Fragment, FunctionComponent, ReactText, useState } from 'react';
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
import Collections from '../../collection/views/Collections';
import { RouteParts } from '../../constants';
import ControlledDropdown from '../../shared/components/ControlledDropdown/ControlledDropdown';
import { BOOKMARKS_ID, COLLECTIONS_ID, FOLDERS_ID, TABS } from '../constants';
import { MyWorkspaceProps, TabViewMap } from '../types';
import Bookmarks from './Bookmarks';

import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import { GET_WORKSPACE_TAB_COUNTS } from '../workspace.gql';
import './MyWorkspace.scss';

const MyWorkspace: FunctionComponent<MyWorkspaceProps> = ({ history, match }) => {
	// State
	const [activeFilter, setActiveFilter] = useState();
	const [tabId, setTabId] = useState(match.params.tabId || COLLECTIONS_ID);

	// Methods
	const goToTab = (id: ReactText) => {
		history.push(`/${RouteParts.MyWorkspace}/${id}`);
		setTabId(String(id));
	};

	// Make map for available tab views
	const getTabs = (counts: { [tabId: string]: number }): TabViewMap => {
		return {
			[COLLECTIONS_ID]: {
				component: <Collections numberOfCollections={counts[COLLECTIONS_ID]} />,
				filter: {
					label: 'Auteur',
					options: [
						{ id: 'all', label: 'Alles' },
						{ id: 'owner', label: 'Enkel waar ik eigenaar ben' },
						{ id: 'sharedWith', label: 'Enkel gedeeld met mij' },
						{ id: 'sharedBy', label: 'Enkel gedeeld door mij' },
					],
				},
			},
			[FOLDERS_ID]: {
				component: <span>TODO Mappen</span>,
				filter: {
					label: 'Filter op label',
					options: [{ id: 'all', label: 'Alle' }],
				},
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
			<Fragment>
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
			</Fragment>
		);
	};

	return (
		<DataQueryComponent
			query={GET_WORKSPACE_TAB_COUNTS}
			// TODO: replace with actual owner id from ldap object
			variables={{ ownerId: '54859c98-d5d3-1038-8d91-6dfda901a78e' }}
			renderData={renderTabsAndContent}
			notFoundMessage="Er zijn geen collecties gevonden"
		/>
	);
};

export default withRouter(MyWorkspace);
