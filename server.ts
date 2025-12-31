import path from 'node:path';
import express from 'express';
import { createServer as createViteServer } from 'vite';

async function createServer() {
  const app = express();

  const clientDir = path.resolve('dist/client');

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  // Use vite's connect instance as middleware. If you use your own
  // express router (express.Router()), you should use router.use
  // When the server restarts (for example after the user modifies
  // vite.config.js), `vite.middlewares` is still going to be the same
  // reference (with a new internal stack of Vite and plugin-injected
  // middlewares). The following is valid even after restarts.
  app.use(vite.middlewares);

  // Serve hashed assets (fast cache)
  app.use(
    '/assets',
    express.static(path.join(clientDir, 'assets'), {
      immutable: true,
      maxAge: '1y',
    }),
  );

  // Serve other static assets (no cache)
  app.use(express.static(clientDir, { index: false }));

  // SSR the other requests
  app.use('*all', async (req, res, next) => {
    const url = `${process.env.CLIENT_URL}${req.originalUrl}`;

    try {
      // Load the server entry. ssrLoadModule automatically transforms
      // ESM source code to be usable in Node.js! There is no bundling
      // required, and provides efficient invalidation similar to HMR.
      const { render } = await vite.ssrLoadModule('./src/entry.server.tsx');

      // Pass the headers from the client request to the ssr server request
      // So logged-in users also produce requests to the proxy with credentials
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) {
        if (v == null) continue;
        headers.set(k, Array.isArray(v) ? v.join(',') : v);
      }

      // render the app HTML
      const response = await render(
        new Request(url, {
          method: req.method,
          headers,
        }),
      );
      const html = await response.text();

      // Send the rendered HTML back.
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (err: any) {
      // If an error is caught, let Vite fix the stack trace so it maps back to your actual source code.
      console.error('[SSR]: Error during render', err);
      vite.ssrFixStacktrace(err);
      next(err);
    }
  });

  app.listen(process.env.PORT);
  console.info(`Client is listening on http://localhost:${process.env.PORT}`);
}

createServer().catch((err) => {
  console.error('failed to start client: ', err);
});
