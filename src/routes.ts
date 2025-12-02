import type { MiddlewareFunction, RouteObject } from 'react-router';
import { CatchAllComponent } from './catch-all.tsx';

async function logRoutesMiddleware({
  request,
}: Parameters<MiddlewareFunction>[0]) {
  console.log(`${request.method} ${request.url}`);
}

const APP_ROUTES: RouteObject[] = [
  // * matches all URLs, the ? makes it optional so it will match / as well
  {
    id: 'catch-all',
    path: '*?',
    middleware: [logRoutesMiddleware],
    Component: CatchAllComponent,
    // lazy: { Component: () => import('./catch-all').then(reactRouterConvert) },
  },
];

export default APP_ROUTES;
