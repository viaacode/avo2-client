import { IconName } from '@viaa/avo2-components';
import { isNil, kebabCase, sortBy } from 'es-toolkit';

import { LoginOptionsDropdown } from '../../authentication/components/LoginOptionsDropdown';
import { PupilOrTeacherDropdown } from '../../authentication/components/PupilOrTeacherDropdown';
import { APP_PATH } from '../../constants';
import { type AppContentNavElement } from '../services/navigation-items-service';
import { type NavigationItemInfo } from '../types';

import { buildLink } from './build-link';
import { isMobileWidth } from './media-query';
import { tText } from './translate-text.ts';

const NAVIGATION_COMPONENTS: { [componentLabel: string]: any } = {
  '<PupilOrTeacherDropdown>': PupilOrTeacherDropdown,
  '<LoginOptionsDropdown>': LoginOptionsDropdown,
};

export type BooleanDictionary = { [id: string]: boolean };

export function getLocation(navItem: AppContentNavElement): string {
  if (!isNil(navItem.content_id)) {
    // Link to content block page
    return `/${navItem.content_id}/${kebabCase(navItem.label)}`;
  }

  if (navItem.content_path) {
    return navItem.content_path;
  }

  console.error('Failed to generate navigation link for navigation item', {
    navItem,
  });
  return buildLink(
    APP_PATH.ERROR.route,
    {},
    {
      message: tText(
        'shared/helpers/navigation___de-pagina-voor-dit-navigatie-item-kon-niet-worden-gevonden',
      ),
      icon: IconName.search,
    },
  );
}

export function mapNavElementsToNavigationItems(
  navItems: AppContentNavElement[],
): NavigationItemInfo[] {
  return sortBy(navItems, ['position']).map(
    (navItem: AppContentNavElement): NavigationItemInfo => {
      const navLocation: string = getLocation(navItem);

      if (NAVIGATION_COMPONENTS[navLocation]) {
        if (isMobileWidth()) {
          return {
            label: navItem.label,
            icon: navItem.icon_name,
            tooltip: navItem.tooltip,
            location: APP_PATH.REGISTER_OR_LOGIN.route,
            target: '_self',
            key: `nav-item-${navItem.id}`,
          };
        }

        // Show component when clicking this nav item
        const Component = NAVIGATION_COMPONENTS[navLocation];

        return {
          label: navItem.label,
          icon: navItem.icon_name,
          tooltip: navItem.tooltip,
          target: '_self',
          component: <Component />,
          key: `nav-item-${navItem.id}`,
        };
      }

      // Navigate to link
      return {
        label: navItem.label,
        icon: navItem.icon_name,
        tooltip: navItem.tooltip,
        location: getLocation(navItem),
        target: navItem.link_target,
        key: `nav-item-${navItem.id}`,
      };
    },
  );
}
