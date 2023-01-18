import { ROUTE_PARTS } from '../../shared/constants';

export const NAVIGATIONS_PATH = {
	NAVIGATIONS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}`,
	NAVIGATIONS_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}/${ROUTE_PARTS.create}`,
	NAVIGATIONS_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}/:menu`,
	NAVIGATIONS_ITEM_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}/:menu/${ROUTE_PARTS.create}`,
	NAVIGATIONS_ITEM_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}/:menu/:id/${ROUTE_PARTS.edit}`,
};
