import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { getAppRoutes } from './App.routes';

const router = createBrowserRouter(getAppRoutes());

hydrateRoot(document, <RouterProvider router={router} />);
