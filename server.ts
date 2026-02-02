import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import packageJson from './package.json' with { type: 'json' };
import { CustomError } from './src/shared/helpers/custom-error.ts';

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

  app.get('/status', async (_req, res) => {
    res.json({
      success: true,
      version: packageJson.version,
      date: new Date().toISOString(),
    });
  });

  app.use('*all', async (req, res, next) => {
    try {
      const url = new URL(`${req.protocol}://${req.host}${req.originalUrl}`);

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

      res
        .status(renderedResponse.status || 200)
        .set(renderedHeaders)
        .end(await renderedResponse.text());
    } catch (e: any) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

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

  app.get('/status', async (_req, res) => {
    res.json({
      success: true,
      version: packageJson.version,
      date: new Date().toISOString(),
    });
  });

  // SSR the other requests
  app.use('*all', async (req, res, next) => {
    const url = new URL(`${req.protocol}://${req.host}${req.originalUrl}`);

    try {
      // Only HTML page navigations
      // Images and other assets can be loaded directly from the file system
      const accept = req.headers.accept ?? '';
      if (!accept.includes('text/html')) {
        return next();
      }

      // Pass the headers from the client request to the ssr server request
      // So logged-in users also produce requests to the proxy with credentials
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) {
        if (v == null) continue;
        headers.set(k, Array.isArray(v) ? v.join(',') : v);
      }

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
      const html = await renderedResponse.text();

      // Send the rendered HTML back.
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (err: any) {
      // If an error is caught, let Vite fix the stack trace so it maps back to your actual source code.
      const error = new CustomError('[SSR]: Error during render', err, {
        url: req.originalUrl,
      });
      console.error(error);
      next(error);
    }
  });

  app.listen(process.env.PORT);
  console.info(`Client is listening on port ${process.env.PORT}`);
}

createServer().catch((err) => {
  console.error('failed to start client: ', err);
});
