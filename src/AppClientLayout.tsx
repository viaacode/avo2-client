import React, { type FC } from 'react';
import { Outlet } from 'react-router';

import 'react-datepicker/dist/react-datepicker.css'; // TODO: lazy-load
import './App.scss';
import './styles/main.scss';
import { ACMIDMNudgeModal } from './shared/components/ACMIDMNudgeModal/ACMIDMNudgeModal';
import { Footer } from './shared/components/Footer/Footer';
import { Navigation } from './shared/components/Navigation/Navigation';
import { ZendeskWrapper } from './shared/components/ZendeskWrapper/ZendeskWrapper';

export const AppClientLayout: FC = () => {
	return (
		<>
			<Navigation isPreviewRoute={false} />
			<Outlet />
			<Footer />
			<ACMIDMNudgeModal />
			<ZendeskWrapper />
		</>
	);
};
