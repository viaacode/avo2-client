import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/client';
import type { AvoAuthLoginResponse } from '@viaa/avo2-types';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import packageJson from './package.json' with { type: 'json' };
import { CustomError } from './src/shared/helpers/custom-error.ts';
import { getEnv } from './src/shared/helpers/env.ts';

const isProd = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  if (isProd) {
    // PRD: Load the SSR app using express
    await startPrdServer();
  } else {
    // DEV: Vite middleware + load SSR from source
    await startDevServer();
  }
}

async function isLoggedIn(request: express.Request): Promise<boolean> {
  const url = `${getEnv('PROXY_URL')}/auth/check-login`;
  const loginResponse = await fetchWithLogoutJson<AvoAuthLoginResponse>(url, {
    headers: {
      cookie: request.headers.cookie || '',
    },
  });
  return loginResponse.message === 'LOGGED_IN';
}

/**
 * DEV: Vite middleware + load SSR from source
 */
async function startDevServer() {
  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  const vite = await createViteServer({
    root: __dirname,
    server: { middlewareMode: true },
    appType: 'custom',
  });

  const app = express();

  // Use vite's connect instance as middleware. If you use your own
  // express router (express.Router()), you should use router.use
  // When the server restarts (for example after the user modifies
  // vite.config.js), `vite.middlewares` is still going to be the same
  // reference (with a new internal stack of Vite and plugin-injected
  // middlewares). The following is valid even after restarts.
  app.use(vite.middlewares);

  app.get('/status', async (_req: express.Request, res: express.Response) => {
    res.json({
      success: true,
      version: packageJson.version,
      date: new Date().toISOString(),
    });
  });

  app.use(
    '*all',
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      const url = new URL(`${req.protocol}://${req.host}${req.originalUrl}`);

      try {
        // Only HTML page navigations
        // Images and other assets can be loaded directly from the file system
        const accept = req.headers.accept ?? '';
        if (!accept.includes('text/html')) {
          return next();
        }

        // rendered html from dev server
        const indexHtmlPath = path.resolve(__dirname, 'index.html');
        const indexHtml = await vite.transformIndexHtml(
          url.toString(),
          fs.readFileSync(indexHtmlPath, 'utf-8'),
        );

        const { render } = await vite.ssrLoadModule('/src/entry.server.tsx');

        const request = new Request(new URL(url), {
          method: req.method,
          headers: req.headers as any,
        });
        const renderedResponse: Response = await render(request, indexHtml);
        const renderedHeaders =
          Object.fromEntries(renderedResponse.headers.entries()) || {};

        // If SSR decided to redirect, don't send HTML, just end the response
        const redirectLocation = renderedResponse.headers.get('Location');
        const isRedirect =
          renderedResponse.status >= 300 &&
          renderedResponse.status < 400 &&
          !!redirectLocation;

        if (isRedirect) {
          res.status(renderedResponse.status || 200).set(renderedHeaders);
          res.end();
          return;
        }

        res
          .status(renderedResponse.status || 200)
          .set(renderedHeaders)
          .end(await renderedResponse.text());
      } catch (err: any) {
        vite.ssrFixStacktrace(err);
        console.error('[DEV][SSR] failed, serving CSR fallback:', err);
        next(err);
      }
    },
  );

  return app.listen(process.env.PORT, () => {
    console.info(`Dev SSR listening on http://localhost:${process.env.PORT}`);
  });
}

/**
 * PRD: Load the SSR app using express
 */
async function startPrdServer() {
  console.info('starting PRD server');
  const distFolder = path.resolve(__dirname, '..');
  const clientDistFolder = path.resolve(distFolder, 'client');
  const indexHtmlPath = path.resolve(clientDistFolder, 'index.html');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

  const app = express();

  // Serve hashed assets (fast cache)
  app.use(
    '/assets',
    express.static(path.resolve(clientDistFolder, 'assets'), {
      immutable: true,
      maxAge: '1y',
    }),
  );

  // Serve other static assets (no cache)
  app.use(express.static(clientDistFolder, { index: false }));

  app.get('/status', async (_req: express.Request, res: express.Response) => {
    res.json({
      success: true,
      version: packageJson.version,
      date: new Date().toISOString(),
    });
  });

  // SSR the other requests
  app.use(
    '*all',
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      const url = new URL(`${req.protocol}://${req.host}${req.originalUrl}`);

      try {
        console.log('----- ssr request: ' + url.toString());
        // Only HTML page navigations
        // Images and other assets can be loaded directly from the file system
        const accept = req.headers.accept ?? '';
        if (!accept.includes('text/html')) {
          return next();
        }

        const isUserLoggedIn = await isLoggedIn(req);
        const returnToUrl = url.searchParams.get('returnToUrl');
        console.log('isUserLoggedIn: ' + isUserLoggedIn);
        console.log('returnToUrl: ' + returnToUrl);
        if (returnToUrl && isUserLoggedIn) {
          // If the user is logged in and a returnToUrl is set, redirect to that URL
          res.redirect(returnToUrl);
          return;
        }

        // Pass the headers from the client request to the ssr server request
        // So logged-in users also produce requests to the proxy with credentials
        const headers = new Headers();
        for (const [k, v] of Object.entries(req.headers)) {
          if (v == null) continue;
          headers.set(k, Array.isArray(v) ? v.join(',') : (v as string));
        }

        let outputHtml: string;
        try {
          // Load the server entry. ssrLoadModule automatically transforms
          // ESM source code to be usable in Node.js! There is no bundling
          // required, and provides efficient invalidation similar to HMR.
          let render = (await import('./src/entry.server.tsx')).render;

          // render the app HTML
          const renderedResponse = await render(
            new Request(url, {
              method: req.method,
              headers,
            }),
            indexHtml,
          );

          // Handle client side redirect request
          const renderedHeaders = Object.fromEntries(
            renderedResponse.headers.entries(),
          );

          // If SSR decided to redirect, don't send HTML, just end the response
          const redirectLocation = renderedResponse.headers.get('Location');
          const isRedirect =
            renderedResponse.status >= 300 &&
            renderedResponse.status < 400 &&
            !!redirectLocation;

          if (isRedirect) {
            console.log('redirecting: ' + redirectLocation);
            res.status(renderedResponse.status || 200).set(renderedHeaders);
            res.end();
            return;
          }

          console.log('regular ssr render: ' + url.toString());
          res.status(renderedResponse.status || 200).set(renderedHeaders);
          outputHtml = await renderedResponse.text();
        } catch (err) {
          // An error occurred in the server side rendering
          // Return the index HTML, so the client side JavaScript can still render the application in the browser
          outputHtml = indexHtml;
        }

        // Send the rendered HTML back.
        res.status(200).set({ 'Content-Type': 'text/html' }).end(outputHtml);
      } catch (err: any) {
        // If an error is caught, let Vite fix the stack trace so it maps back to your actual source code.
        const error = new CustomError('[SSR]: Error during render', err, {
          url: req.originalUrl,
        });
        console.error(error);
        res
          .status(200)
          .set({ 'Content-Type': 'text/html; charset=utf-8' })
          .end(indexHtml);
      }
    },
  );

  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error('[EXPRESS] unhandled error:', err);
      if (res.headersSent) return;
      res.status(500).json({ ok: false });
    },
  );

  app.listen(process.env.PORT);
  console.info(
    `Client is listening on port ${process.env.PORT} with NODE_ENV = ${process.env.NODE_ENV}`,
  );
}

createServer().catch((err) => {
  console.error('failed to start client: ', err);
});
