import { ROUTE_PARTS } from '../../shared/constants/routes';

export const URL_REDIRECT_PATH = {
  URL_REDIRECT_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.redirects}`,
  URL_REDIRECT_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.redirects}/${ROUTE_PARTS.create}`,
  URL_REDIRECT_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.redirects}/:id/${ROUTE_PARTS.edit}`,
};
