import { ROUTE_PARTS } from '../../shared/constants/index';

export const NAVIGATIONS_PATH = {
  NAVIGATIONS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.navigation}`,
  NAVIGATIONS_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.navigation}/${ROUTE_PARTS.create}`,
  NAVIGATIONS_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.navigation}/:navigationBarId`,
  NAVIGATIONS_ITEM_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.navigation}/:navigationBarId/${ROUTE_PARTS.create}`,
  NAVIGATIONS_ITEM_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.navigation}/:navigationBarId/:navigationItemId/${ROUTE_PARTS.edit}`,
}
