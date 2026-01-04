import { ROUTE_PARTS } from '../../shared/constants/routes';

export const ITEMS_PATH = {
  ITEMS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.items}`,
  PUBLISH_ITEMS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.publishItems}`,
  ITEM_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.items}/:id`,
};
