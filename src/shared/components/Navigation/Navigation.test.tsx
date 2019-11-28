import { Button } from '@viaa/avo2-components';
import { mount, ReactWrapper, shallow } from 'enzyme';
import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import PupilOrTeacherDropdown from '../../../authentication/components/PupilOrTeacherDropdown';
import { APP_PATH } from '../../../constants';
import { DISCOVER_PATH } from '../../../discover/discover.const';
import { SEARCH_PATH } from '../../../search/search.const';
import { COLLECTIONS_ID, WORKSPACE_PATH } from '../../../workspace/workspace.const';
import { ROUTE_PARTS } from '../../constants';
import { buildLink } from '../../helpers';

import Navigation from './Navigation';

const pItems = [
	{ key: 'home', label: 'Home', location: '/' },
	{ key: 'search', label: 'Zoeken', location: SEARCH_PATH.SEARCH },
	{ key: 'discover', label: 'Ontdek', location: DISCOVER_PATH.DISCOVER },
	{
		key: 'workspace',
		label: 'Mijn Werkruimte',
		location: buildLink(WORKSPACE_PATH.WORKSPACE_TAB, { tabId: COLLECTIONS_ID }),
	},
	{ key: 'projects', label: 'Projecten', location: `/${ROUTE_PARTS.projects}` }, // TODO replace when available with PROJECT_PATH
	{ key: 'news', label: 'Nieuws', location: `/${ROUTE_PARTS.news}` },
];

const sItems = [
	{ key: 'createAccount', label: 'Account aanmaken', component: <PupilOrTeacherDropdown /> },
	{ key: 'login', label: 'Aanmelden', location: APP_PATH.LOGIN_AVO },
];

function checkLinks(menuItems: ReactWrapper<any, any>) {
	const links = menuItems.find(Link);

	expect(links).toHaveLength(sItems.length);

	links.forEach((link, index) => {
		if (link.prop('to')) {
			expect(link.text()).toEqual(sItems[index].label);
			expect(link.prop('to')).toEqual(sItems[index].location);
		} else {
			expect(sItems[index].component).toBeDefined();
		}
	});
}

describe('<Navigation />', () => {
	it('Should be able to render', () => {
		shallow(<Navigation primaryItems={pItems} secondaryItems={sItems} isOpen={false} />);
	});

	it('Should correctly render the `primaryItems` on desktop', () => {
		const navigationComponent = mount(
			<Router>
				<Navigation primaryItems={pItems} secondaryItems={sItems} isOpen={false} />
			</Router>
		);

		const primaryMenuDesktop = navigationComponent.find('.u-mq-switch-main-nav-has-space .c-nav');

		checkLinks(primaryMenuDesktop);
	});

	it('Should correctly render the `secondaryItems` on desktop', () => {
		const navigationComponent = mount(
			<Router>
				<Navigation primaryItems={pItems} secondaryItems={sItems} isOpen={false} />
			</Router>
		);

		const secondaryMenuDesktop = navigationComponent.find(
			'.u-mq-switch-main-nav-authentication .c-nav'
		);

		checkLinks(secondaryMenuDesktop);
	});

	it('Should correctly render the mobile menu when `isOpen` ', () => {
		const closedNavigationComponent = mount(
			<Router>
				<Navigation primaryItems={pItems} secondaryItems={sItems} isOpen={false} />
			</Router>
		);

		const openNavigationComponent = mount(
			<Router>
				<Navigation primaryItems={pItems} secondaryItems={sItems} isOpen />
			</Router>
		);

		const closedMenuMobile = closedNavigationComponent.find('.c-nav-mobile');
		const openMenuMobile = openNavigationComponent.find('.c-nav-mobile');

		expect(closedMenuMobile.length).toEqual(0);
		expect(openMenuMobile.length).toEqual(2);
	});

	it('Should correctly render the `primaryItems` on mobile', () => {
		const navigationComponent = mount(
			<Router>
				<Navigation primaryItems={pItems} secondaryItems={sItems} isOpen />
			</Router>
		);

		const primaryMenuMobile = navigationComponent.find('.c-nav-mobile').first();

		const links = primaryMenuMobile.find(Link);

		checkLinks(links);
	});

	it('Should correctly render the `secondaryItems` on mobile', () => {
		const navigationComponent = mount(
			<Router>
				<Navigation primaryItems={pItems} secondaryItems={sItems} isOpen />
			</Router>
		);

		const secondaryMenuMobile = navigationComponent.find('.c-nav-mobile').last();

		const links = secondaryMenuMobile.find(Link);

		checkLinks(links);
	});

	it('Should call `handleMenuClick` when clicking menu toggle', () => {
		const handleMenuClickHandler = jest.fn();

		const navigationComponent = mount(
			<Router>
				<Navigation
					primaryItems={pItems}
					secondaryItems={sItems}
					isOpen={false}
					handleMenuClick={handleMenuClickHandler}
				/>
			</Router>
		);

		const menuToggleButton = navigationComponent.find(Button);

		expect(handleMenuClickHandler).toHaveBeenCalledTimes(0);

		menuToggleButton.simulate('click');

		expect(handleMenuClickHandler).toHaveBeenCalledTimes(1);
	});
});
