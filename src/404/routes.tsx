import React from 'react';

import { Route } from 'react-router';
import SecuredRoute from '../authentication/components/SecuredRoute';
import NotFound from './views/NotFound';

export const renderNotFoundRoutes = () => <Route component={NotFound} />;
