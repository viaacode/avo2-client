import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router-dom';

import { Container } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { connect } from 'react-redux';
import { selectLoginMessage, selectUser } from '../../../authentication/store/selectors';
import { AppState } from '../../../store';
import { mapNavElementsToNavigationItems, renderNavLinkItem } from '../../helpers/navigation';
import {
	AppContentNavElement,
	getNavigationItems,
	NavItemMap,
} from '../../services/navigation-items-service';
import { NavigationItem } from '../../types';

import './Footer.scss';

export interface FooterProps extends RouteComponentProps {
	user: Avo.User.User | undefined;
}

const Footer: FunctionComponent<FooterProps> = ({ history, location, match, user }) => {
	const [t] = useTranslation();

	const [areDropdownsOpen, setDropdownsOpen] = useState<{ [key: string]: boolean }>({});
	const [primaryNavItems, setPrimaryNavItems] = useState<AppContentNavElement[]>([]);
	const [secondaryNavItems, setSecondaryNavItems] = useState<AppContentNavElement[]>([]);

	useEffect(() => {
		getNavigationItems().then((navItems: NavItemMap) => {
			setPrimaryNavItems(navItems['footer-links']);
			setSecondaryNavItems(navItems['footer-rechts']);
		});
	}, [user]);

	const getPrimaryNavigationItems = (): NavigationItem[] => {
		return mapNavElementsToNavigationItems(primaryNavItems, history, location, match, t);
	};

	const getSecondaryNavigationItems = (): NavigationItem[] => {
		return mapNavElementsToNavigationItems(secondaryNavItems, history, location, match, t);
	};

	return (
		<footer className="c-global-footer">
			<Container mode="horizontal" className="c-global-footer__inner">
				<ul>
					{getPrimaryNavigationItems().map(item =>
						renderNavLinkItem(
							item,
							'c-nav__item c-nav__item--i',
							true,
							false,
							areDropdownsOpen,
							setDropdownsOpen
						)
					)}
				</ul>
				<ul>
					{getSecondaryNavigationItems().map(item =>
						renderNavLinkItem(
							item,
							'c-nav__item c-nav__item--i',
							true,
							false,
							areDropdownsOpen,
							setDropdownsOpen
						)
					)}
				</ul>
			</Container>
		</footer>
	);
};

const mapStateToProps = (state: AppState) => ({
	loginMessage: selectLoginMessage(state),
	user: selectUser(state),
});

export default connect(mapStateToProps)(Footer);
