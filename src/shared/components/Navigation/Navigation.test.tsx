import { mount, ReactWrapper } from 'enzyme';
import React from 'react';
import { BrowserRouter as Router, Link, MemoryRouter } from 'react-router-dom';

import { APP_PATH } from '../../../constants';
import { getMockRouterProps } from '../../mocks/route-components-props-mock';
import mockUser from '../../mocks/user-mock';

import { Navigation } from './Navigation';

const linkLoginState: {
	[routePath: string]: { showWhenLoggedIn: boolean; showWhenLoggedOut: boolean };
} = {
	[APP_PATH.LOGGED_IN_HOME]: { showWhenLoggedIn: true, showWhenLoggedOut: false },
	[APP_PATH.SEARCH]: { showWhenLoggedIn: true, showWhenLoggedOut: false },
	[APP_PATH.DISCOVER]: { showWhenLoggedIn: true, showWhenLoggedOut: false },
	[APP_PATH.WORKSPACE]: { showWhenLoggedIn: true, showWhenLoggedOut: false },
	[APP_PATH.PROJECTS]: { showWhenLoggedIn: true, showWhenLoggedOut: true },
	[APP_PATH.NEWS]: { showWhenLoggedIn: true, showWhenLoggedOut: true },
	[APP_PATH.FOR_TEACHERS]: { showWhenLoggedIn: false, showWhenLoggedOut: true },
	[APP_PATH.FOR_PUPILS]: { showWhenLoggedIn: false, showWhenLoggedOut: true },
	[APP_PATH.SETTINGS]: { showWhenLoggedIn: true, showWhenLoggedOut: false },
	[APP_PATH.HELP]: { showWhenLoggedIn: true, showWhenLoggedOut: false },
	[APP_PATH.FEEDBACK]: { showWhenLoggedIn: true, showWhenLoggedOut: false },
	[APP_PATH.LOGOUT]: { showWhenLoggedIn: true, showWhenLoggedOut: false },
	[APP_PATH.REGISTER_OR_LOGIN]: { showWhenLoggedIn: false, showWhenLoggedOut: true },
};

function checkLinks(menuItems: ReactWrapper<any, any>, loggedIn: boolean) {
	const links = menuItems.find(Link);

	links.forEach(link => {
		const to = link.prop('to');
		if (to) {
			expect(link.text()).toBeTruthy();
			expect(Object.values(APP_PATH).includes(to.toString())).toEqual(true);
			if (loggedIn) {
				expect(
					linkLoginState[to.toString()].showWhenLoggedIn,
					`Expected nav item to route ${to.toString()} to be visible when logged in`
				).toEqual(true);
			} else {
				expect(linkLoginState[to.toString()].showWhenLoggedOut).toEqual(true);
			}
		} else {
			expect(link.children()).toBeDefined();
			expect(link.children()).toHaveLength(1);
		}
	});
}

const mockProps = getMockRouterProps({});

describe('<Navigation />', () => {
	it('Should be able to render', () => {
		// Render unconnected navigation component (best practice according to react test docs:
		// https://redux.js.org/recipes/writing-tests#connected-components
		mount(
			<MemoryRouter>
				<Navigation {...mockProps} loginMessage={'LOGGED_OUT'} user={undefined} />
			</MemoryRouter>
		);
	});

	it('Should correctly render navbar links when logged out on desktop', () => {
		const navigationComponent = mount(
			<Router>
				<Navigation {...mockProps} loginMessage={'LOGGED_OUT'} user={undefined} />
			</Router>
		);

		const primaryMenuDesktop = navigationComponent.find('.u-mq-switch-main-nav-has-space .c-nav');

		checkLinks(primaryMenuDesktop, false);

		const secondaryMenuDesktop = navigationComponent.find(
			'.u-mq-switch-main-nav-authentication .c-nav'
		);

		checkLinks(secondaryMenuDesktop, false);
	});

	it('Should correctly render navbar links when logged in on desktop', () => {
		const navigationComponent = mount(
			<Router>
				<Navigation {...mockProps} loginMessage={'LOGGED_IN'} user={mockUser} />
			</Router>
		);

		const primaryMenuDesktop = navigationComponent.find('.u-mq-switch-main-nav-has-space .c-nav');

		checkLinks(primaryMenuDesktop, true);

		const secondaryMenuDesktop = navigationComponent.find(
			'.u-mq-switch-main-nav-authentication .c-nav'
		);

		checkLinks(secondaryMenuDesktop, true);
	});
});
