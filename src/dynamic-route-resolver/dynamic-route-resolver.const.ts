import { type ReactNode } from 'react';

import { tHtml } from '../shared/helpers/translate-html';

export const GET_ERROR_MESSAGES: () => { [key: string]: ReactNode } = () => ({
  DEPUBLISHED_PAGINA: tHtml(
    'dynamic-route-resolver/dynamic-route-resolver___deze-pagina-is-niet-meer-beschikbaar',
  ),
  PUPIL_ONLY: tHtml(
    'dynamic-route-resolver/dynamic-route-resolver___deze-pagina-is-enkel-voor-leerlingen',
  ),
  NOT_FOR_PUPILS: tHtml(
    'dynamic-route-resolver/dynamic-route-resolver___deze-pagina-is-niet-voor-leerlingen',
  ),
  OTHER_ROLES: tHtml(
    'dynamic-route-resolver/dynamic-route-resolver___deze-pagina-is-enkel-voor-gebruikers-met-andere-rechten',
  ),
  DEPUBLISHED_EVENT_DETAIL: tHtml(
    'dynamic-route-resolver/dynamic-route-resolver___dit-event-is-reeds-afgelopen-a-href-workshops-en-events-bekijk-al-onze-events-a',
  ),
});

export enum DynamicRouteType {
  BUNDLE = 'BUNDLE',
  CONTENT_PAGE = 'CONTENT_PAGE',
  DEPUBLISHED_CONTENT_PAGE = 'DEPUBLISHED_CONTENT_PAGE',
  PUPIL_ONLY_PAGE = 'PUPIL_ONLY_PAGE',
  NOT_FOR_PUPIL_PAGE = 'NOT_FOR_PUPIL_PAGE',
  WRONG_USER_GROUP_PAGE = 'WRONG_USER_GROUP_PAGE',
  NOT_FOUND = 'NOT_FOUND',
}
