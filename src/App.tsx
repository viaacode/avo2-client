import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type Avo } from '@viaa/avo2-types';
import classnames from 'classnames';
import { createBrowserHistory } from 'history';
import { noop } from 'lodash-es';
import { wrapHistory } from 'oaf-react-router';
import React, { type FunctionComponent, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import {
	Route,
	type RouteComponentProps,
	BrowserRouter as Router,
	withRouter,
} from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import { compose } from 'redux';
import { QueryParamProvider } from 'use-query-params';

import Admin from './admin/Admin';
import { ADMIN_PATH } from './admin/admin.const';
import { withAdminCoreConfig } from './admin/shared/hoc/with-admin-core-config';
import { SpecialUserGroup } from './admin/user-groups/user-group.const';
import { SecuredRoute } from './authentication/components';
import { APP_PATH } from './constants';
import { renderRoutes } from './routes';
import {
	Footer,
	LoadingErrorLoadedComponent,
	type LoadingInfo,
	Navigation,
} from './shared/components';
import ACMIDMNudgeModal from './shared/components/ACMIDMNudgeModal/ACMIDMNudgeModal';
import ConfirmModal from './shared/components/ConfirmModal/ConfirmModal';
import ZendeskWrapper from './shared/components/ZendeskWrapper/ZendeskWrapper';
import { ROUTE_PARTS } from './shared/constants';
import { CustomError } from './shared/helpers';
import withUser, { type UserProps } from './shared/hocs/withUser';
import useTranslation from './shared/hooks/useTranslation';
import { ToastService } from './shared/services/toast-service';
import { waitForTranslations } from './shared/translations/i18n';
import store from './store';

import 'react-datepicker/dist/react-datepicker.css'; // TODO: lazy-load
import './styles/main.scss';
import './App.scss';

const history = createBrowserHistory();
wrapHistory(history, {
	smoothScroll: false,
	shouldHandleAction: (
		previousLocation: RouteComponentProps['location'],
		nextLocation: RouteComponentProps['location']
	) => {
		// We don't want to set focus when only the hash changes
		return (
			previousLocation.pathname !== nextLocation.pathname ||
			previousLocation.search !== nextLocation.search
		);
	},
});

const App: FunctionComponent<RouteComponentProps & UserProps> = (props) => {
	const { tHtml } = useTranslation();
	const isAdminRoute = new RegExp(`^/${ROUTE_PARTS.admin}`, 'g').test(props.location.pathname);
	const isPupilUser = [SpecialUserGroup.PupilSecondary, SpecialUserGroup.PupilElementary]
		.map(String)
		.includes(String(props.commonUser?.userGroup?.id));

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	useEffect(() => {
		waitForTranslations
			.then(() => {
				setLoadingInfo({ state: 'loaded' });
			})
			.catch((err) => {
				console.error(new CustomError('Failed to wait for translations', err));
			});
	}, [setLoadingInfo]);

	useEffect(() => {
		// Hide zendesk when a pupil is logged in
		if (isPupilUser || isAdminRoute) {
			document.body.classList.add('hide-zendesk-widget');
		} else {
			document.body.classList.remove('hide-zendesk-widget');
		}
	}, [isPupilUser, isAdminRoute]);

	useEffect(() => {
		if (loadingInfo.state === 'loaded') {
			const url = new URL(window.location.href);
			const linked: Avo.Auth.IdpLinkedSuccessQueryParam = 'linked';
			const hasLinked = url.searchParams.get(linked) !== null;
			if (hasLinked) {
				ToastService.success(tHtml('app___je-account-is-gekoppeld'));
				url.searchParams.delete(linked);
				history.replace(url.toString().replace(url.origin, ''));
			}
		}
	}, [loadingInfo, tHtml]);

	// Render
	const renderApp = () => {
		const isLoginRoute = props.location.pathname === APP_PATH.LOGIN.route;

		return (
			<div
				className={classnames('o-app', {
					'o-app--admin': isAdminRoute,
				})}
			>
				<ToastContainer
					autoClose={4000}
					className="c-alert-stack"
					closeButton={false}
					closeOnClick={false}
					draggable={false}
					position="bottom-left"
					transition={Slide}
				/>
				{isAdminRoute ? (
					<SecuredRoute component={Admin} exact={false} path={ADMIN_PATH.DASHBOARD} />
				) : (
					<>
						{!isLoginRoute && <Navigation {...props} />}
						{renderRoutes()}
						{!isLoginRoute && <Footer {...props} />}
						<ACMIDMNudgeModal />
					</>
				)}
				<ZendeskWrapper />
			</div>
		);
	};

	return (
		<>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				dataObject={{}}
				render={renderApp}
			/>
		</>
	);
};

const AppWithRouter = compose(withRouter, withUser, withAdminCoreConfig)(App) as FunctionComponent;

let confirmUnsavedChangesCallback: ((navigateAway: boolean) => void) | null;

const queryClient = new QueryClient();

const Root: FunctionComponent = () => {
	const { tText, tHtml } = useTranslation();
	const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false);

	return (
		<QueryClientProvider client={queryClient}>
			<Provider store={store}>
				<Router
					getUserConfirmation={(_message, callback) => {
						setIsUnsavedChangesModalOpen(true);
						confirmUnsavedChangesCallback = callback;
					}}
				>
					<QueryParamProvider ReactRouterRoute={Route}>
						<AppWithRouter />
						<ConfirmModal
							className="c-modal__unsaved-changes"
							isOpen={isUnsavedChangesModalOpen}
							confirmCallback={() => {
								setIsUnsavedChangesModalOpen(false);
								(confirmUnsavedChangesCallback || noop)(true);
								confirmUnsavedChangesCallback = null;
							}}
							onClose={() => {
								setIsUnsavedChangesModalOpen(false);
								(confirmUnsavedChangesCallback || noop)(false);
								confirmUnsavedChangesCallback = null;
							}}
							cancelLabel={tText('app___blijven')}
							confirmLabel={tText('app___verlaten')}
							title={tHtml('app___wijzigingen-opslaan')}
							body={tHtml(
								'app___er-zijn-nog-niet-opgeslagen-wijzigingen-weet-u-zeker-dat-u-de-pagina-wil-verlaten'
							)}
							confirmButtonType="primary"
						/>
					</QueryParamProvider>
				</Router>
			</Provider>
		</QueryClientProvider>
	);
};

export default Root;
