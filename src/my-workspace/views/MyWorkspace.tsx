import React, { Fragment, FunctionComponent, ReactText, useState } from 'react';
import { withRouter } from 'react-router';

import {
	Button,
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
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import Collections from '../../collection/views/Collections';
import ControlledDropdown from '../../shared/components/ControlledDropdown/ControlledDropdown';
import { BOOKMARKS_ID, COLLECTIONS_ID, FOLDERS_ID, TABS } from '../constants';
import { MyWorkspaceProps, TabViewMap } from '../types';
import Bookmarks from './Bookmarks';

import './MyWorkspace.scss';

const MyWorkspace: FunctionComponent<MyWorkspaceProps> = ({ collections, history, match }) => {
	// State
	const [activeFilter, setActiveFilter] = useState();
	const [tabId, setTabId] = useState(match.params.tabId || COLLECTIONS_ID);

	// Methods
	const getAmount = (arr: any[] | null): string =>
		arr && arr.length > 0 ? ` (${arr.length})` : '';

	const goToTab = (id: ReactText) => {
		history.push(`/mijn-werkruimte/${id}`);
		setTabId(String(id));
	};

	// Computed
	// Make map for available tab views
	const TAB_MAP: TabViewMap = {
		[COLLECTIONS_ID]: {
			addHandler: () => {},
			amount: getAmount([collections]),
			component: <Collections />,
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
			amount: getAmount([]),
			component: <span>TODO Mappen</span>,
			filter: {
				label: 'Filter op label',
				options: [{ id: 'all', label: 'Alle' }],
			},
		},
		[BOOKMARKS_ID]: {
			addHandler: () => {},
			amount: getAmount([]),
			component: <Bookmarks />,
		},
	};
	// Set active tab based on above map with tabId
	const activeTab = TAB_MAP[tabId];
	const navTabs = TABS.map(t => ({
		...t,
		active: tabId === t.id,
		label: t.label + TAB_MAP[t.id].amount,
	}));

	// Render
	const renderAddButton = () => {
		if (activeTab.addHandler) {
			return <Button icon="add" label="Aanmaken" onClick={activeTab.addHandler} type="secondary" />;
		}
	};

	const renderFilter = () => {
		const filter = activeTab.filter;

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

	return (
		<Fragment>
			<Container background="alt" mode="vertical" size="small">
				<Container mode="horizontal">
					<Toolbar autoHeight>
						<ToolbarLeft>
							<ToolbarItem>
								<h2 className="c-h2 u-m-0">Mijn Werkruimte</h2>
							</ToolbarItem>
						</ToolbarLeft>
						<ToolbarRight>
							<span className="p-my-workspace__action-placeholder">{renderAddButton()}</span>
						</ToolbarRight>
					</Toolbar>
				</Container>
			</Container>

			<Navbar background="alt" placement="top" autoHeight>
				<Container mode="horizontal">
					<Toolbar autoHeight>
						<ToolbarLeft>
							<Tabs tabs={navTabs} onClick={goToTab} />
						</ToolbarLeft>
						<ToolbarRight>
							<span>{renderFilter()}</span>
						</ToolbarRight>
					</Toolbar>
				</Container>
			</Navbar>

			<Container mode="vertical" size="small">
				<Container mode="horizontal">{activeTab.component}</Container>
			</Container>
		</Fragment>
	);
};

export default withRouter(MyWorkspace);
