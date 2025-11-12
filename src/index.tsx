import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { setDefaultOptions } from 'date-fns';
import { nlBE } from 'date-fns/locale';
import React, { type FC } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { createBrowserRouter } from 'react-router-dom';

import ALL_APP_ROUTES from './routes';

// Set moment language to Dutch
setDefaultOptions({
  locale: nlBE,
});

const router = createBrowserRouter(ALL_APP_ROUTES);

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
