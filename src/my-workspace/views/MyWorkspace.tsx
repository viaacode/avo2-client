import React, { Fragment, FunctionComponent, ReactElement, ReactText, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';

import {
	Button,
	Container,
	DropdownButton,
	DropdownContent,
	Form,
	FormGroup,
	Icon,
	MenuContent,
	MenuItemInfo,
	Navbar,
	Tabs,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import Collections from '../../collection/views/Collections';
import ControlledDropdown from '../../shared/components/ControlledDropdown/ControlledDropdown';
import Bookmarks from './Bookmarks';

import { selectCollections } from '../../collection/store/selectors';

type TabView = {
	addHandler?: () => void;
	amount: string;
	component: ReactElement;
	filter?: {
		label: string;
		options: MenuItemInfo[];
	};
};

type TabViewMap = {
	[key: string]: TabView;
};

interface MyWorkspaceProps extends RouteComponentProps<{ tabId: string }> {
	collections: any[] | null;
}

const COLLECTIONS_ID = 'collecties';
const MAPS_ID = 'mappen';
const BOOKMARKS_ID = 'bladwijzers';
const FAVORITES_ID = 'favorieten';

const tabs = [
	{
		label: 'Collecties',
		icon: 'collection',
		id: COLLECTIONS_ID,
	},
	{
		label: 'Mappen',
		icon: 'folder',
		id: MAPS_ID,
	},
	{
		label: 'Bladwijzers',
		icon: 'bookmark',
		id: BOOKMARKS_ID,
	},
	{
		label: 'Favorieten',
		icon: 'heart',
		id: FAVORITES_ID,
	},
];

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
	const TAB_MAP: TabViewMap = {
		[COLLECTIONS_ID]: {
			addHandler: () => {},
			amount: getAmount(collections),
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
		[MAPS_ID]: {
			amount: getAmount([]),
			component: <span>TODO Maps</span>,
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
		[FAVORITES_ID]: {
			amount: getAmount([]),
			component: <span>TODO Maps</span>,
		},
	};

	const activeTab = TAB_MAP[tabId];
	const navTabs = tabs.map(t => ({
		...t,
		active: tabId === t.id,
		label: t.label + TAB_MAP[t.id].amount,
	}));

	// Render
	const renderAddButton = () => {
		if (activeTab.addHandler) {
			return <Button icon="add" label="Aanmaken" onClick={activeTab.addHandler} type="secondary" />;
		}
		// Must return something because the toolbar slots can't be empty
		return <span />;
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
		// Must return something because the toolbar slots can't be empty
		return <span />;
	};

	return (
		<Fragment>
			<Container background="alt" mode="vertical" size="small">
				<Container mode="horizontal">
					<Toolbar autoHeight>
						<ToolbarLeft>
							<ToolbarItem>
								<h2 className="c-h2 u-m-0">Mijn Archief</h2>
							</ToolbarItem>
						</ToolbarLeft>
						<ToolbarRight>{renderAddButton()}</ToolbarRight>
					</Toolbar>
				</Container>
			</Container>

			<Navbar background="alt" placement="top" autoHeight>
				<Container mode="horizontal">
					<Toolbar autoHeight>
						<ToolbarLeft>
							<Tabs tabs={navTabs} onClick={goToTab} />
						</ToolbarLeft>
						<ToolbarRight>{renderFilter()}</ToolbarRight>
					</Toolbar>
				</Container>
			</Navbar>

			<Container mode="vertical" size="small">
				<Container mode="horizontal">{activeTab.component}</Container>
			</Container>
		</Fragment>
	);
};

const mapStateToProps = (state: any) => ({
	collections: selectCollections(state),
});

export default connect(mapStateToProps)(MyWorkspace);
