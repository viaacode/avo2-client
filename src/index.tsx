import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setDefaultOptions } from 'date-fns';
import { nlBE } from 'date-fns/locale';
import React, { type FC, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { type LoaderFunction, RouterProvider } from 'react-router';
import { createBrowserRouter } from 'react-router-dom';

import { getAppRoutes } from './App.routes';
import { ToastService } from './shared/services/toast-service';

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

function wrapLoader(id: string | undefined, loaderFn: true | LoaderFunction<any>) {
	return async (args: any) => {
		console.debug(`[loader start] route ${id}`, { args });
		const result = await (loaderFn as LoaderFunction<any>)(args);
		console.debug(`[loader end] route ${id}`, { result });
		return result;
	};
}

const instrumentedRoutes = getAppRoutes().map((route) => ({
	...route,
	loader: route.loader ? wrapLoader(route.id || route.path, route.loader) : undefined,
}));
const router = createBrowserRouter(instrumentedRoutes);

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
