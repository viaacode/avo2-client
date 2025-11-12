import { ROUTE_PARTS } from '../../shared/constants/index';

export const USER_PATH = {
  USER_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.users}`,
  USER_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.users}/:id`,
  USER_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.users}/:id/${ROUTE_PARTS.edit}`,
};
