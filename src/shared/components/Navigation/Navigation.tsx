import { ContentPagePreviewUserRoleSelector } from '@meemoo/admin-core-ui/admin';
import {
  Avatar,
  Button,
  Container,
  Icon,
  IconName,
  MenuContent,
  Navbar,
  Toolbar,
  ToolbarItem,
  ToolbarLeft,
  ToolbarRight,
} from '@viaa/avo2-components';
import { last } from 'es-toolkit';
import { useAtomValue, useSetAtom } from 'jotai';
import { type FC, type ReactText, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AvoLogoSrc from '../../../assets/images/avo-logo-i.svg';

import { loginAtom } from '../../../authentication/authentication.store';
import { getLoginStateAtom } from '../../../authentication/authentication.store.actions';
import {
  getProfileAvatar,
  getProfileInitials,
} from '../../../authentication/helpers/get-profile-info';
import { redirectToExternalPage } from '../../../authentication/helpers/redirects/redirect-to-external-page';
import { redirectToClientPage } from '../../../authentication/helpers/redirects/redirects';
import { APP_PATH } from '../../../constants';
import {
  getLocation,
  mapNavElementsToNavigationItems,
} from '../../helpers/navigation';
import { useAllGetNavItems } from '../../hooks/useAllGetNavItems';
import { useHideZendeskWidget } from '../../hooks/useHideZendeskWidget';
import { ToastService } from '../../services/toast-service';
import { type NavigationItemInfo } from '../../types';

import { NavigationBarId } from './Navigation.const';
import { NavigationItem } from './NavigationItem';

import './Navigation.scss';
import { AvoAuthLoginResponseLoggedIn } from '@viaa/avo2-types';
import { tHtml } from '../../helpers/translate-html';
import { tText } from '../../helpers/translate-text';

type NavigationParams = {
  isPreviewRoute: boolean;
  url: string;
};

/**
 * Main navigation bar component
 */
export const Navigation: FC<NavigationParams> = ({ isPreviewRoute, url }) => {
  const navigateFunc = useNavigate();

  const loginAtomValue = useAtomValue(loginAtom);
  const loginState = loginAtomValue.data;
  const loginStateLoading = loginAtomValue.loading;
  const loginStateError = loginAtomValue.error;
  const getLoginState = useSetAtom(getLoginStateAtom);

  const [areDropdownsOpen, setDropdownsOpen] = useState<{
    [key: string]: boolean;
  }>({});
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUserGroupSelectorOpen, setIsUserGroupSelectorOpen] = useState(false);

  const { data: allNavItems } = useAllGetNavItems();

  /**
   * @deprecated
   */
  const user = (loginState as AvoAuthLoginResponseLoggedIn)?.userInfo;
  const commonUser = (loginState as AvoAuthLoginResponseLoggedIn)
    ?.commonUserInfo;

  /**
   * Computed
   */
  const navItemsLeft =
    allNavItems?.[NavigationBarId.MAIN_NAVIGATION_LEFT] || [];
  const navItemsRight =
    allNavItems?.[NavigationBarId.MAIN_NAVIGATION_RIGHT] || [];
  const navItemsProfileDropdown =
    allNavItems?.[NavigationBarId.PROFILE_DROPDOWN] || [];

  useHideZendeskWidget(commonUser, isUserGroupSelectorOpen);

  useEffect(() => {
    if (!loginState && !loginStateLoading && !loginStateError) {
      getLoginState(false);
      return;
    }
  });

  const mapNavItems = (navItems: NavigationItemInfo[], isMobile: boolean) => {
    return navItems.map((item) => (
      <NavigationItem
        key={item.key}
        item={item}
        className={'c-nav__item c-nav__item--i'}
        showActive={false}
        areDropdownsOpen={areDropdownsOpen}
        setDropdownsOpen={setDropdownsOpen}
        isMobile={isMobile}
        onNavigate={() => setMobileMenuOpen(false)}
      />
    ));
  };

  const getNavigationItemsLeft = (): NavigationItemInfo[] => {
    return mapNavElementsToNavigationItems(navItemsLeft);
  };

  const getNavigationItemsRight = (): NavigationItemInfo[] => {
    if (
      (!navItemsRight || !navItemsRight.length) &&
      (!navItemsProfileDropdown || !navItemsProfileDropdown.length)
    ) {
      return [];
    }
    const dynamicNavItemsRight: NavigationItemInfo[] =
      mapNavElementsToNavigationItems(navItemsRight);
    const dynamicNavItemsProfileDropdown: NavigationItemInfo[] =
      mapNavElementsToNavigationItems(navItemsProfileDropdown);

    const logoutNavItem = last(
      dynamicNavItemsProfileDropdown,
    ) as NavigationItemInfo;

    if (
      // (user && logoutNavItem.location !== APP_PATH.LOGOUT.route) ||
      !commonUser &&
      logoutNavItem?.location === APP_PATH.LOGOUT.route
    ) {
      // Avoid flashing the menu items for a second without them being in a dropdown menu
      return [];
    }

    if (commonUser) {
      if (isMobileMenuOpen) {
        return [...dynamicNavItemsRight, ...dynamicNavItemsProfileDropdown];
      }
      // Navigatie items voor ingelogde gebruikers (dropdown onder profile avatar)
      return [
        ...dynamicNavItemsRight,
        {
          label: (
            <div className="c-navbar-profile-dropdown-button">
              <Avatar
                initials={getProfileInitials(commonUser)}
                name={commonUser?.firstName || ''}
                image={getProfileAvatar(commonUser)}
              />
              <Icon name={IconName.caretDown} size="small" />
            </div>
          ),
          component: (
            <MenuContent
              menuItems={[
                dynamicNavItemsProfileDropdown
                  .slice(0, dynamicNavItemsProfileDropdown.length - 1)
                  .map((navItem) => ({
                    id: navItem.key as string,
                    label: navItem.label as string,
                  })),
                [
                  {
                    id: logoutNavItem?.key as string,
                    label: logoutNavItem?.label as string,
                  },
                ],
              ]}
              onClick={handleMenuClick}
            />
          ),
          target: '_self',
          key: 'profile',
        },
      ];
    }

    // Navigatie items voor niet ingelogde gebruikers: items naast elkaar
    return dynamicNavItemsRight;
  };

  const onToggleMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

  const closeAllDropdowns = () => setDropdownsOpen({});

  const handleMenuClick = (menuItemId: string | ReactText) => {
    try {
      const navItemId: number = parseInt(
        menuItemId.toString().substring('nav-item-'.length),
        10,
      );
      const navItem = [...navItemsRight, ...navItemsProfileDropdown].find(
        (navItem) => navItem.id === navItemId,
      );
      if (!navItem) {
        console.error('Could not find navigation item by id', { menuItemId });
        ToastService.danger(
          tHtml(
            'shared/components/navigation/navigation___dit-menu-item-kon-niet-worden-geopend-1',
          ),
        );
        return;
      }
      const link = getLocation(navItem);
      if (link.includes('//')) {
        // external link
        redirectToExternalPage(link, navItem.link_target || '_blank');
      } else {
        // Internal link to react page or to content block page
        redirectToClientPage(link, navigateFunc);
      }
      closeAllDropdowns();
    } catch (err) {
      console.error(
        'Failed to handle menu item click because it is not a number',
        err,
        {
          menuItemId,
        },
      );
      ToastService.danger(
        tHtml(
          'shared/components/navigation/navigation___dit-menu-item-kon-niet-worden-geopend-2',
        ),
      );
    }
  };

  return (
    <>
      <Navbar
        background="inverse"
        position="fixed"
        placement="top"
        autoHeight={true}
      >
        {isPreviewRoute && (
          <Container background={'white'}>
            <Container mode="horizontal" className="u-d-flex">
              <ContentPagePreviewUserRoleSelector
                className="c-content-page-preview-selector"
                onToggleMenu={setIsUserGroupSelectorOpen}
                url={url}
              />
            </Container>
          </Container>
        )}
        <Container mode="horizontal">
          <Toolbar>
            <ToolbarLeft>
              <ToolbarItem>
                <h1 className="c-brand">
                  <Link
                    to={
                      user
                        ? APP_PATH.LOGGED_IN_HOME.route
                        : APP_PATH.LOGGED_OUT_HOME.route
                    }
                  >
                    <img alt="Archief voor Onderwijs logo" src={AvoLogoSrc} />
                  </Link>
                </h1>
              </ToolbarItem>
              <ToolbarItem>
                <div className="u-mq-switch-main-nav-has-space">
                  <ul className="c-nav">
                    {mapNavItems(getNavigationItemsLeft(), false)}
                  </ul>
                </div>
              </ToolbarItem>
            </ToolbarLeft>
            <ToolbarRight>
              <ToolbarItem>
                <div className="u-mq-switch-main-nav-authentication">
                  <ul className="c-nav">
                    {mapNavItems(getNavigationItemsRight(), false)}
                  </ul>
                </div>
              </ToolbarItem>
              <ToolbarItem>
                <div className="u-mq-switch-main-nav-very-little-space">
                  <Button
                    icon={IconName.menu}
                    type="borderless-i"
                    title={tText(
                      'shared/components/navigation/navigation___open-het-navigatie-menu',
                    )}
                    ariaLabel={tText(
                      'shared/components/navigation/navigation___open-het-navigatie-menu',
                    )}
                    onClick={onToggleMenu}
                  />
                </div>
              </ToolbarItem>
            </ToolbarRight>
          </Toolbar>
        </Container>
      </Navbar>
      {isMobileMenuOpen ? (
        <Container mode="horizontal" className="c-mobile-menu">
          <Container mode="vertical">
            <ul className="c-nav-mobile">
              {mapNavItems(getNavigationItemsLeft(), true)}
            </ul>
            <ul className="c-nav-mobile">
              {mapNavItems(getNavigationItemsRight(), true)}
            </ul>
          </Container>
        </Container>
      ) : (
        <Navbar
          className="u-mq-switch-main-nav-little-space"
          background="inverse"
          placement="top"
        >
          <Container mode="horizontal">
            <Toolbar>
              <ToolbarLeft>
                <div className="c-toolbar__item">
                  <ul className="c-nav">
                    {mapNavItems(getNavigationItemsLeft(), false)}
                  </ul>
                </div>
              </ToolbarLeft>
            </Toolbar>
          </Container>
        </Navbar>
      )}
    </>
  );
};
