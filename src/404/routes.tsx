import React from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import NotFound from './views/NotFound';

export const renderNotFoundRoutes = () => <SecuredRoute component={NotFound} />;
