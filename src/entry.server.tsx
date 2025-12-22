import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// React is required to be imported for SSR even if it is not directly used in this file. This import must be identical between server and client entry files
// @ts-ignore
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { Helmet } from 'react-helmet';
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
  try {
    console.log('[SSR] requesting route: ' + new URL(request.url).pathname);

    // 1. run actions/loaders to get the routing context with `query`
    let context = await query(request);

    // If `query` returns a Response, send it raw (a route probably a redirected)
    if (context instanceof Response) {
      return context;
    }

    // 2. Create a static router for SSR
    let router = createStaticRouter(dataRoutes, context);
    const helmet = Helmet.renderStatic();
    console.log('[SSR] Helmet title:', helmet.title.toString());
    console.log('[SSR] Helmet meta tags:', helmet.meta.toString());

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

    let mergedHtml = indexHtml.replace(
      '<div id="root"></div>',
      `<div id="root">${html}</div>`,
    );

    // Render title and meta tags from the Helmet component during server side rendering
    mergedHtml = mergedHtml.replace(
      '<!-- HELMET_TAGS_REPLACEMENT_MARKER -->',
      `    
        ${helmet?.title.toString()}
        ${helmet?.meta.toString()}
      `,
    );

    // 4. send a response
    return new Response(mergedHtml, {
      status: context.statusCode,
      headers,
    });
  } catch (err) {
    console.error('Error during SSR rendering:', err);

    return new Response(`<pre>${String(err)}</pre>`, {
      status: 500,
    });
  }
}
