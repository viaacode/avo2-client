import { setDefaultOptions } from 'date-fns';
import { nlBE } from 'date-fns/locale';
import { Provider } from 'jotai';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import ALL_APP_ROUTES from './routes.ts';
import { store } from './shared/store/ui.store.ts';
import {
  loadTranslations,
  refreshTranslations,
} from './shared/translations/i18n.ts';

import 'react-datepicker/dist/react-datepicker.css'; // TODO: lazy-load
import '@viaa/avo2-components/styles.css';
import '@meemoo/react-components/styles.css';
import '@meemoo/admin-core-ui/admin.css';
import '@meemoo/admin-core-ui/client.css';
import './App.scss';
import './styles/main.scss';

// Set date-fns language to Dutch
setDefaultOptions({
  locale: nlBE,
});

async function hydrate() {
  // Load translations before hydration (uses SSR-injected resources if available)
  await loadTranslations();

  const hasHydrationData =
    window.__staticRouterHydrationData?.loaderData != null;
  const hasSSRContent =
    document.getElementById('root')?.children.length ?? 0 > 0;

  const router = createBrowserRouter(ALL_APP_ROUTES, {
    hydrationData: hasHydrationData
      ? window.__staticRouterHydrationData
      : undefined,
  });

  const container = document.getElementById('root') as HTMLElement;

  const app = (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );

  if (hasHydrationData && hasSSRContent) {
    // SSR succeeded: hydrate the server-rendered HTML
    hydrateRoot(container, app, {
      onRecoverableError(error, errorInfo) {
        console.error('Hydration recoverable error:', error);
        console.error('Component stack:', errorInfo.componentStack);
      },
    });
  } else {
    // SSR failed or no hydration data: do a clean client-side render
    createRoot(container).render(app);
  }

  // Refresh translations in the background after hydration
  refreshTranslations();
}

hydrate();
