import { setDefaultOptions } from 'date-fns';
import { nlBE } from 'date-fns/locale';
import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import ALL_APP_ROUTES from './routes.ts';

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

const router = createBrowserRouter(ALL_APP_ROUTES, {
  hydrationData: window.__staticRouterHydrationData,
});

const container = document.getElementById('root') as HTMLElement;

hydrateRoot(container, <RouterProvider router={router} />, {
  onRecoverableError(error, errorInfo) {
    console.error('Hydration recoverable error:', error);
    console.error('Component stack:', errorInfo.componentStack);
  },
});
