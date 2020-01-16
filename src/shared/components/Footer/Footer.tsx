import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router-dom';

import { Container } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { connect } from 'react-redux';
import { selectLoginMessage, selectUser } from '../../../authentication/store/selectors';
import { AppState } from '../../../store';
import { BooleanDictionary, mapNavElementsToNavigationItems } from '../../helpers/navigation';
import {
	AppContentNavElement,
	getNavigationItems,
	NavItemMap,
} from '../../services/navigation-items-service';
import { NavigationItemInfo } from '../../types';

import NavigationItem from '../Navigation/NavigationItem';
import './Footer.scss';

export interface FooterProps extends RouteComponentProps {
	user: Avo.User.User | undefined;
}

const Footer: FunctionComponent<FooterProps> = ({ history, location, match, user }) => {
	const [t] = useTranslation();

	const [areDropdownsOpen, setDropdownsOpen] = useState<BooleanDictionary>({});
	const [primaryNavItems, setPrimaryNavItems] = useState<AppContentNavElement[]>([]);
	const [secondaryNavItems, setSecondaryNavItems] = useState<AppContentNavElement[]>([]);

	useEffect(() => {
		getNavigationItems().then((navItems: NavItemMap) => {
			setPrimaryNavItems(navItems['footer-links']);
			setSecondaryNavItems(navItems['footer-rechts']);
		});
	}, [user]);

	const getPrimaryNavigationItems = (): NavigationItemInfo[] => {
		return mapNavElementsToNavigationItems(primaryNavItems, history, location, match, t);
	};

	const getSecondaryNavigationItems = (): NavigationItemInfo[] => {
		return mapNavElementsToNavigationItems(secondaryNavItems, history, location, match, t);
	};

	const mapNavItems = (navItems: NavigationItemInfo[]) => {
		return navItems.map(item => (
			<NavigationItem
				key={item.key}
				item={item}
				className="c-nav__item c-nav__item--i"
				exact={item.location === '/'}
				showActive={false}
				areDropdownsOpen={areDropdownsOpen}
				setDropdownsOpen={setDropdownsOpen}
				history={history}
				location={location}
				match={match}
			/>
		));
	};

	return (
		<footer className="c-global-footer">
			<Container mode="horizontal" className="c-global-footer__inner">
				<ul>{mapNavItems(getPrimaryNavigationItems())}</ul>
				<ul>{mapNavItems(getSecondaryNavigationItems())}</ul>
			</Container>
		</footer>
	);
};

const mapStateToProps = (state: AppState) => ({
	loginMessage: selectLoginMessage(state),
	user: selectUser(state),
});

export default connect(mapStateToProps)(Footer);
