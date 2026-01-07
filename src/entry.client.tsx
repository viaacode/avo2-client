import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { setDefaultOptions } from 'date-fns';
import { nlBE } from 'date-fns/locale'; // React is required to be imported for SSR even if it is not directly used in this file. This import must be identical between server and client entry files
// @ts-ignore
import { type FC } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { createBrowserRouter } from 'react-router-dom';
import ALL_APP_ROUTES from './routes.ts'; // Set moment language to Dutch

import 'react-datepicker/dist/react-datepicker.css'; // TODO: lazy-load
import '@viaa/avo2-components/styles.css';
import '@meemoo/react-components/styles.css';
import '@meemoo/admin-core-ui/admin.css';
import '@meemoo/admin-core-ui/client.css';
import './App.scss';
import './styles/main.scss';

// Set moment language to Dutch
setDefaultOptions({
  locale: nlBE,
});

const router = createBrowserRouter(ALL_APP_ROUTES, {
  hydrationData: window.__staticRouterHydrationData,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      placeholderData: keepPreviousData,
      retry: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
    },
  },
});

const Root: FC = () => {
  return (
    // React query
    <QueryClientProvider client={queryClient}>
      {/* React router */}
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<Root />);
