import React from 'react';
import SecuredRoute from '../authentication/components/SecuredRoute';
import Search from './views/Search';

export const renderSearchRoutes = () => <SecuredRoute component={Search} path="/search" />;
