import { shallow } from 'enzyme';
import React from 'react';

import Sidebar from './Sidebar';

const sidebarProps = {
	headerLink: '/beheer',
	navItems: [
		{ label: 'Navigatie', location: '/beheer/navigatie', key: 'navigatie' },
		{ label: 'Content', location: '/beheer/content', key: 'content' },
	],
};

describe('<Sidebar />', () => {
	const sidebarComponent = shallow(<Sidebar {...sidebarProps} />);

	it('Should be able to render', () => {
		shallow(<Sidebar {...sidebarProps} />);
	});

	it('Should render a header with `headerLink`', () => {
		const sidebarHeader = sidebarComponent.find('.o-sidebar__header');
		const sidebarHeaderLink = sidebarComponent.find('Link');

		expect(sidebarHeader).toHaveLength(1);
		expect(sidebarHeaderLink).toHaveLength(1);
		expect(sidebarHeaderLink.prop('to')).toEqual(sidebarProps.headerLink);
	});

	it('Should render the `navItems`', () => {
		const sidebarNav = sidebarComponent.find('.o-sidebar__nav');
		const sidebarNavItems = sidebarNav.find('.o-sidebar__nav-item');
		const sidebarLastLink = sidebarNavItems.at(1).childAt(0);

		expect(sidebarNav).toHaveLength(1);
		expect(sidebarNavItems).toHaveLength(sidebarProps.navItems.length);
		expect(sidebarLastLink.text()).toEqual(sidebarProps.navItems[1].label);
	});
});
