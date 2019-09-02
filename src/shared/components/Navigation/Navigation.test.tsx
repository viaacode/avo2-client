import { Button } from '@viaa/avo2-components';
import { mount, shallow } from 'enzyme';
import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import { RouteParts } from '../../../constants';
import { Navigation } from './Navigation';

const pItems = [
	{ label: 'Home', location: '/' },
	{ label: 'Zoeken', location: `/${RouteParts.Search}` },
	{ label: 'Ontdek', location: `/${RouteParts.Discover}` },
	{ label: 'Mijn Werkruimte', location: `/${RouteParts.MyWorkspace}/${RouteParts.Collections}` },
	{ label: 'Projecten', location: `/${RouteParts.Projects}` },
	{ label: 'Nieuws', location: `/${RouteParts.News}` },
];

const sItems = [
	{ label: 'Registreren', location: `/${RouteParts.Register}` },
	{ label: 'Aanmelden', location: `/${RouteParts.Login}` },
];

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

		const links = primaryMenuDesktop.find(Link);

		expect(links).toHaveLength(pItems.length);

		links.forEach((link, index) => {
			expect(link.text()).toEqual(pItems[index].label);
			expect(link.prop('to')).toEqual(pItems[index].location);
		});
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

		const links = secondaryMenuDesktop.find(Link);

		expect(links).toHaveLength(sItems.length);

		links.forEach((link, index) => {
			expect(link.text()).toEqual(sItems[index].label);
			expect(link.prop('to')).toEqual(sItems[index].location);
		});
	});

	it('Should correctly render the mobile menu when `isOpen` ', () => {
		const closedNavigationComponent = mount(
			<Router>
				<Navigation primaryItems={pItems} secondaryItems={sItems} isOpen={false} />
			</Router>
		);

		const openNavigationComponent = mount(
			<Router>
				<Navigation primaryItems={pItems} secondaryItems={sItems} isOpen={true} />
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
				<Navigation primaryItems={pItems} secondaryItems={sItems} isOpen={true} />
			</Router>
		);

		const primaryMenuMobile = navigationComponent.find('.c-nav-mobile').first();

		const links = primaryMenuMobile.find(Link);

		expect(links).toHaveLength(pItems.length);

		links.forEach((link, index) => {
			expect(link.text()).toEqual(pItems[index].label);
			expect(link.prop('to')).toEqual(pItems[index].location);
		});
	});

	it('Should correctly render the `secondaryItems` on mobile', () => {
		const navigationComponent = mount(
			<Router>
				<Navigation primaryItems={pItems} secondaryItems={sItems} isOpen={true} />
			</Router>
		);

		const secondaryMenuMobile = navigationComponent.find('.c-nav-mobile').last();

		const links = secondaryMenuMobile.find(Link);

		expect(links).toHaveLength(sItems.length);

		links.forEach((link, index) => {
			expect(link.text()).toEqual(sItems[index].label);
			expect(link.prop('to')).toEqual(sItems[index].location);
		});
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
