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

let clientDir: string;
if (process.env.NODE_ENV === 'production') {
  clientDir = path.resolve(__dirname, '../dist/client');
} else {
  clientDir = path.resolve(__dirname, '../');
}

const indexHtml = fs.readFileSync(path.join(clientDir, 'index.html'), 'utf8');

export async function render(request: Request) {
  try {
    console.log('[SSR] requesting route: ' + new URL(request.url).pathname);

    // Run actions/loaders to get the routing context with `query`
    let context = await query(request);

    // If `query` returns a Response, send it raw (a route probably a redirected)
    if (context instanceof Response) {
      return context;
    }

    // Create a static router for SSR
    let router = createStaticRouter(dataRoutes, context);

    // Render everything with StaticRouterProvider
    let html = renderToString(
      <StaticRouterProvider router={router} context={context} />,
    );

    // Render the meta tags and title tags
    const helmet = Helmet.renderStatic();

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

    // Insert the rendered html into the index.html file
    let mergedHtml = indexHtml.replace(
      '<div id="root"></div>',
      `<div id="root">${html}</div>`,
    );

    // Render title and meta tags from the Helmet component during server side rendering
    const title = helmet?.title.toString();
    const metaTags = helmet?.meta.toString().replace(/<meta/g, '\n\t<meta');
    mergedHtml = mergedHtml.replace(
      '<!-- HELMET_TAGS_REPLACEMENT_MARKER -->',
      `${title}${metaTags}`.replace(/ data-react-helmet="true"/g, ''),
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
