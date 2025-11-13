import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import React, { type ReactNode } from 'react'
import { Outlet, Scripts, ScrollRestoration } from 'react-router'

import 'react-datepicker/dist/react-datepicker.css' // TODO: lazy-load
import './App.scss'
import './styles/main.scss'
import { ToastService } from './shared/services/toast-service';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="8fb68e92-94b2-4334-bc47-7bcda08bc9c7"
          data-blockingmode="auto"
          type="text/javascript"
        />

        {/* Init .env variables */}
        <script src="/env-config.js" data-cookieconsent="ignore" />

        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
							(function (w, d, s, l, i) {
								w[l] = w[l] || [];
								w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
								let f = d.getElementsByTagName(s)[0],
								j = d.createElement(s),
								dl = l != "dataLayer" ? "&l=" + l : "";
								j.async = true;
								j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
								f.parentNode.insertBefore(j, f);
							})(window, document, "script", "dataLayer", window._ENV_.GOOGLE_ANALYTICS_ID);
						`,
          }}
        />
        {/* End Google Tag Manager */}

        {/*	Mouseflow Tag */}
        {/*	<script type="text/javascript">*/}
        {/*		if (window._ENV_.MOUSEFLOW_ANALYTICS_ID) {*/}
        {/*			window._mfq = window._mfq || [];*/}
        {/*			(function () {*/}
        {/*				var mf = document.createElement("script");*/}
        {/*				mf.type = "text/javascript";*/}
        {/*				mf.defer = true;*/}
        {/*				mf.src = "//cdn.mouseflow.com/projects/" + window._ENV_.MOUSEFLOW_ANALYTICS_ID + ".js";*/}
        {/*				document.getElementsByTagName("head")[0].appendChild(mf);*/}
        {/*			})();*/}
        {/*		}*/}
        {/*	</script>*/}
        {/*	End Mouseflow Tag */}

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preload" href="/fonts/montserrat-italic.woff2" as="font" />
        <link rel="preload" href="/fonts/montserrat-medium.woff2" as="font" />
        <link
          rel="preload"
          href="/fonts/avenir-lt-std-medium.woff2"
          as="font"
        />
        <title>Het Archief voor Onderwijs</title>
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MNSTNVJ"
            height="0"
            width="0"
            style="display: none; visibility: hidden"
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* No-JS fallback */}
        <noscript>You need to enable JavaScript to run this app.</noscript>

        {/* Main react app node */}
        {children}
        <ScrollRestoration />

        {/* Load the React app scripts */}
        <Scripts />

        {/* Detect old browsers */}
        <script src="/old-browser-detector.min.js" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
							let Detector = new oldBrowserDetector(null, function () {
								// unsupported browser
								window.open("/unsupported-browser.html");
							});
							
								Detector.detect();
							</script>
							
							{/* Detect no access to localstorage */}
							<script type="text/javascript">
								try {
								const _ls = window.localStorage;
							} catch (err) {
								// Local storage is not available => flowplayer will crash the page => redirect to the backend error page
								window.location.href = window._ENV_.PROXY_URL + "/third-party-cookies";
							}
						`,
          }}
        />
      </body>
    </html>
  )
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query: any) => {
      if (query.meta?.errorMessage) {
        console.error(error)
        ToastService.danger(query.meta.errorMessage as ReactNode | string)
      }
    },
  }),
})

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* React router */}
      <Outlet />
    </QueryClientProvider>
  )
}
