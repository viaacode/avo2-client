import React from 'react';
import { Route } from 'react-router';

import Home from './views/Home';

export const renderHomeRoutes = () => <Route component={Home} path="/" exact={true} />;
