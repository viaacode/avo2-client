import React, { type FC } from 'react';
import { Navigate } from 'react-router';
import { useLocation } from 'react-router-dom';

const AdminRedirect: FC = () => {
	const location = useLocation();

	return <Navigate to={location.pathname.replace(/^\/beheer/g, '/admin') + location.search} />;
};

export default AdminRedirect as unknown as FC;
