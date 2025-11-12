import express from 'express'
import React from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import {
  createStaticHandler,
  createStaticRouter,
  type StaticHandlerContext,
  StaticRouterProvider,
} from 'react-router'

const app = express()

app.use(express.static('public')) // serve static assets (CSS/JS bundles)

app.all('*', async (req, res) => {
  try {
    // 1) Prepare loaders/actions for the incoming request
    const handler = createStaticHandler(getAppRoutes())
    const context = (await handler.query(
      new Request(req.url, {
        method: req.method,
        headers: req.headers as any,
        body:
          req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      }),
    )) as StaticHandlerContext

    // 2) Create router for this request
    const router = createStaticRouter(getAppRoutes(), context)

    // 3) Stream the response
    const { pipe } = renderToPipeableStream(
      <StaticRouterProvider router={router} context={context} />,
      {
        onShellReady() {
          res.status(context.statusCode ?? 200)
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.write(
            "<!DOCTYPE html><html><head><title>App</title></head><body><div id='root'>",
          )
          pipe(res)
          res.write("</div><script src='/client.js'></script></body></html>")
        },
        onError(err) {
          console.error(err)
          res.status(500).send('Server Error')
        },
      },
    )
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
})

app.listen(8080, () => {
  console.log('SSR server running at http://localhost:8080')
})
