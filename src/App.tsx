import { ApolloClient, ApolloProvider as ApolloHooksProvider } from '@apollo/react-hooks';
import { Avo } from '@viaa/avo2-types';
import classnames from 'classnames';
import { createBrowserHistory } from 'history';
import { noop } from 'lodash-es';
import { wrapHistory } from 'oaf-react-router';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import 'react-datepicker/dist/react-datepicker.css'; // TODO: lazy-load
import { useTranslation } from 'react-i18next';
import { Provider } from 'react-redux';
import { Route, RouteComponentProps, BrowserRouter as Router, withRouter } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import { compose } from 'redux';
import { QueryParamProvider } from 'use-query-params';

import Admin from './admin/Admin';
import { ADMIN_PATH } from './admin/admin.const';
import { SpecialUserGroup } from './admin/user-groups/user-group.const';
import { SecuredRoute } from './authentication/components';
import { APP_PATH } from './constants';
import { renderRoutes } from './routes';
import { Footer, LoadingErrorLoadedComponent, LoadingInfo, Navigation } from './shared/components';
import ACMIDMNudgeModal from './shared/components/ACMIDMNudgeModal/ACMIDMNudgeModal';
import ConfirmModal from './shared/components/ConfirmModal/ConfirmModal';
import ZendeskWrapper from './shared/components/ZendeskWrapper/ZendeskWrapper';
import { ROUTE_PARTS } from './shared/constants';
import { CustomError } from './shared/helpers';
import { insideIframe } from './shared/helpers/inside-iframe';
import withUser, { UserProps } from './shared/hocs/withUser';
import { dataService, ToastService } from './shared/services';
import { waitForTranslations } from './shared/translations/i18n';
import store from './store';
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
	const isAdminRoute = new RegExp(`^/${ROUTE_PARTS.admin}`, 'g').test(props.location.pathname);

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
		if (props?.user?.profile?.userGroupIds?.[0] === SpecialUserGroup.Pupil) {
			document.body.classList.add('hide-zendesk-widget');
		} else {
			document.body.classList.remove('hide-zendesk-widget');
		}
	}, [props.user]);

	// Render
	const renderApp = () => {
		const isInsideIframe = insideIframe();
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
						{!isLoginRoute && !isInsideIframe && <Footer {...props} />}
						{!isInsideIframe && <ZendeskWrapper />}
						<ACMIDMNudgeModal />
					</>
				)}
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

const AppWithRouter = compose(withRouter, withUser)(App) as FunctionComponent;

let confirmUnsavedChangesCallback: ((navigateAway: boolean) => void) | null;

const Root: FunctionComponent = () => {
	const [t] = useTranslation();
	const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false);

	useEffect(() => {
		const url = new URL(window.location.href);
		const linked: Avo.Auth.IdpLinkedSuccessQueryParam = 'linked';
		const hasLinked = url.searchParams.get(linked) !== null;
		if (hasLinked) {
			ToastService.success(t('app___je-account-is-gekoppeld'));
			url.searchParams.delete(linked);
			history.replace(url.toString().replace(url.origin, ''));
		}
	}, []);

	return (
		<ApolloProvider client={dataService}>
			<ApolloHooksProvider client={dataService as unknown as ApolloClient<any>}>
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
								cancelLabel={t('app___blijven')}
								confirmLabel={t('app___verlaten')}
								title={t('app___wijzigingen-opslaan')}
								body={t(
									'app___er-zijn-nog-niet-opgeslagen-wijzigingen-weet-u-zeker-dat-u-de-pagina-wil-verlaten'
								)}
								confirmButtonType="primary"
							/>
						</QueryParamProvider>
					</Router>
				</Provider>
			</ApolloHooksProvider>
		</ApolloProvider>
	);
};

export default Root;
