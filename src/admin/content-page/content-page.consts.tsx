import { ROUTE_PARTS } from '../../shared/constants/index.js'

export const CONTENT_PAGE_PATH = {
  CONTENT_PAGE_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}`,
  CONTENT_PAGE_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}/${ROUTE_PARTS.create}`,
  CONTENT_PAGE_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}/:id`,
  CONTENT_PAGE_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}/:id/${ROUTE_PARTS.edit}`,
  CONTENT_PAGE_PAGES: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}?content_type=PAGINA`,
  CONTENT_PAGE_NEWS: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}?content_type=NIEUWS_ITEM`,
  CONTENT_PAGE_FAQS: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}?content_type=FAQ_ITEM`,
  CONTENT_PAGE_SCREENCASTS: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}?content_type=SCREENCAST`,
  CONTENT_PAGE_PROJECTS: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}?content_type=PROJECT`,
  CONTENT_PAGE_OVERVIEWS: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.content}?content_type=OVERZICHT`,
}
