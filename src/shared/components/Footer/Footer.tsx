// eslint-disable-next-line import/no-unresolved
import meemooLogo from '@assets/images/meemoo-logo.png';
// eslint-disable-next-line import/no-unresolved
import vlaamseOverheidLogo from '@assets/images/vlaanderen-logo.png';
import { Container, Spacer } from '@viaa/avo2-components';
import React, { type FC, useEffect, useState } from 'react';
import { type RouteComponentProps } from 'react-router';

import useTranslation from '../../../shared/hooks/useTranslation';
import { type BooleanDictionary, mapNavElementsToNavigationItems } from '../../helpers/navigation';
import withUser, { type UserProps } from '../../hocs/withUser';
import {
	type AppContentNavElement,
	getNavigationItems,
	type NavItemMap,
} from '../../services/navigation-items-service';
import { type NavigationItemInfo } from '../../types';
import { NavigationItem } from '../Navigation/NavigationItem';

import './Footer.scss';

const Footer: FC<RouteComponentProps & UserProps> = ({ history, location, match, commonUser }) => {
	const { tText } = useTranslation();

	const [areDropdownsOpen, setDropdownsOpen] = useState<BooleanDictionary>({});
	const [primaryNavItems, setPrimaryNavItems] = useState<AppContentNavElement[]>([]);
	const [secondaryNavItems, setSecondaryNavItems] = useState<AppContentNavElement[]>([]);

	useEffect(() => {
		getNavigationItems()
			.then((navItems: NavItemMap) => {
				setPrimaryNavItems(navItems['footer-links']);
				setSecondaryNavItems(navItems['footer-rechts']);
			})
			.catch((err) => {
				console.error('Failed to get navigation items', err);
				// Do not notify the user, since this will happen in the header navigation component already
				// And we don't want to show 2 error toast messages
			});
	}, [history, tText, commonUser]);

	const getPrimaryNavigationItems = (): NavigationItemInfo[] => {
		return mapNavElementsToNavigationItems(primaryNavItems, tText);
	};

	const getSecondaryNavigationItems = (): NavigationItemInfo[] => {
		return mapNavElementsToNavigationItems(secondaryNavItems, tText);
	};

	const mapNavItems = (navItems: NavigationItemInfo[]) => {
		return navItems.map((item) => (
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
				<ul>
					<li>
						<a
							href="https://meemoo.be/nl"
							title={tText('shared/components/footer/footer___meemoo')}
						>
							<span className="c-nav__item-label">
								{tText('shared/components/footer/footer___een-initiatief-van')}
							</span>
							<Spacer margin="left-small">
								<img
									src={meemooLogo}
									alt={tText('shared/components/footer/footer___logo-van-meemoo')}
								/>
							</Spacer>
						</a>
					</li>
					{mapNavItems(getPrimaryNavigationItems())}
				</ul>
				<ul>
					{mapNavItems(getSecondaryNavigationItems())}
					<li>
						<a
							href="https://www.vlaanderen.be/"
							title={tText('shared/components/footer/footer___vlaamse-overheid')}
						>
							<span className="c-nav__item-label">
								{tText('shared/components/footer/footer___gesteund-door')}
							</span>
							<Spacer margin="left-small">
								<img
									src={vlaamseOverheidLogo}
									alt={tText(
										'shared/components/footer/footer___logo-van-vlaamse-overheid'
									)}
								/>
							</Spacer>
						</a>
					</li>
				</ul>
			</Container>
		</footer>
	);
};

export default withUser(Footer) as FC<RouteComponentProps>;
