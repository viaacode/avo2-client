import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setDefaultOptions } from 'date-fns';
import { nlBE } from 'date-fns/locale';
import React, { type FC, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { createBrowserRouter } from 'react-router-dom';

import pkg from '../package.json';

import { getAppRoutes } from './App.routes';
import { ToastService } from './shared/services/toast-service';

// Expose app info through the window object
window.APP_INFO = {
	mode: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
	version: pkg.version,
};

// Set moment language to Dutch
setDefaultOptions({
	locale: nlBE,
});
const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error, query) => {
			if (query.meta?.errorMessage) {
				console.error(error);
				ToastService.danger(query.meta.errorMessage as ReactNode | string);
			}
		},
	}),
});

const router = createBrowserRouter(getAppRoutes());

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
