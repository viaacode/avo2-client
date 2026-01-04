import { ROUTE_PARTS } from '../../shared/constants/routes';

export const INTERACTIVE_TOUR_PATH = {
  INTERACTIVE_TOUR_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.interactiveTours}`,
  INTERACTIVE_TOUR_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.interactiveTours}/${ROUTE_PARTS.create}`,
  INTERACTIVE_TOUR_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.interactiveTours}/:id/${ROUTE_PARTS.edit}`,
  INTERACTIVE_TOUR_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.interactiveTours}/:id/${ROUTE_PARTS.detail}`,
};
