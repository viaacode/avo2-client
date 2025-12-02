import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// React is required to be imported for SSR even if it is not directly used in this file
// @ts-ignore
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router';
import APP_ROUTES from './routes.ts';

let { query, dataRoutes } = createStaticHandler(APP_ROUTES);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const indexHtml = fs.readFileSync(
  path.resolve(__dirname, '../index.html'),
  'utf8',
);

export async function render(request: Request) {
  // 1. run actions/loaders to get the routing context with `query`
  let context = await query(request);

  // If `query` returns a Response, send it raw (a route probably a redirected)
  if (context instanceof Response) {
    return context;
  }

  // 2. Create a static router for SSR
  let router = createStaticRouter(dataRoutes, context);

  // 3. Render everything with StaticRouterProvider
  let html = renderToString(
    <StaticRouterProvider router={router} context={context} />,
  );

  // Setup headers from action and loaders from deepest match
  let leaf = context.matches[context.matches.length - 1];
  let actionHeaders = context.actionHeaders[leaf.route.id];
  let loaderHeaders = context.loaderHeaders[leaf.route.id];
  let headers = new Headers(actionHeaders);
  if (loaderHeaders) {
    for (let [key, value] of loaderHeaders.entries()) {
      headers.append(key, value);
    }
  }

  headers.set('Content-Type', 'text/html; charset=utf-8');

  // 4. send a response
  return new Response(
    indexHtml.replace('<div id="root"></div>', `<div id="root">${html}</div>`),
    {
      status: context.statusCode,
      headers,
    },
  );
}
