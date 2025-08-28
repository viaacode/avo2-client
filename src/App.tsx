import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import { createBrowserHistory } from 'history';
import { isEqual, noop, uniq } from 'lodash-es';
import { wrapHistory } from 'oaf-react-router';
import React, { type FC, type ReactNode, useCallback, useEffect, useState } from 'react';
import { connect, Provider } from 'react-redux';
import {
	Route,
	type RouteComponentProps,
	BrowserRouter as Router,
	useLocation,
	withRouter,
} from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import { compose, type Dispatch } from 'redux';
import { QueryParamProvider } from 'use-query-params';

import Admin from './admin/Admin';
import { ADMIN_PATH } from './admin/admin.const';
import { withAdminCoreConfig } from './admin/shared/hoc/with-admin-core-config';
import { SpecialUserGroupId } from './admin/user-groups/user-group.const';
import { SecuredRoute } from './authentication/components';
import { PermissionService } from './authentication/helpers/permission-service';
import { APP_PATH } from './constants';
import { renderRoutes } from './routes';
import ACMIDMNudgeModal from './shared/components/ACMIDMNudgeModal/ACMIDMNudgeModal';
import { ConfirmModal } from './shared/components/ConfirmModal/ConfirmModal';
import Footer from './shared/components/Footer/Footer';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from './shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import Navigation from './shared/components/Navigation/Navigation';
import ZendeskWrapper from './shared/components/ZendeskWrapper/ZendeskWrapper';
import { ROUTE_PARTS } from './shared/constants';
import { CustomError } from './shared/helpers/custom-error';
import withUser, { type UserProps } from './shared/hocs/withUser';
import { usePageLoaded } from './shared/hooks/usePageLoaded';
import useTranslation from './shared/hooks/useTranslation';
import { ToastService } from './shared/services/toast-service';
import { waitForTranslations } from './shared/translations/i18n';
import store, { type AppState } from './store';
import { setEmbedFlowAction, setHistoryLocationsAction } from './store/actions';
import { selectHistoryLocations } from './store/selectors';

import 'react-datepicker/dist/react-datepicker.css'; // TODO: lazy-load
import './App.scss';
import './styles/main.scss';

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

const App: FC<
	RouteComponentProps &
		UserProps & {
			historyLocations: string[];
			setHistoryLocations: (locations: string[]) => void;
			setEmbedFlow: (embedFlow: string) => void;
		}
> = ({ setEmbedFlow, ...props }) => {
	const { tHtml } = useTranslation();
	const location = useLocation();
	const isAdminRoute = new RegExp(`^/${ROUTE_PARTS.admin}`, 'g').test(props.location.pathname);
	const isPupilUser = [SpecialUserGroupId.PupilSecondary, SpecialUserGroupId.PupilElementary]
		.map(String)
		.includes(String(props.commonUser?.userGroup?.id));

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	/**
	 * Scroll to the element with the id that is in the hash of the url
	 */
	const handlePageLoaded = useCallback(() => {
		if (window.location.hash) {
			const decodedHash = decodeURIComponent(window.location.hash).replaceAll(' ', '-');
			document.querySelector(decodedHash)?.scrollIntoView({ behavior: 'smooth' });
		}
	}, []);
	usePageLoaded(handlePageLoaded, !!props.location.hash);

	/**
	 * Wait for translations to be loaded before rendering the app
	 */
	useEffect(() => {
		waitForTranslations
			.then(() => {
				setLoadingInfo({ state: 'loaded' });
			})
			.catch((err) => {
				console.error(new CustomError('Failed to wait for translations', err));
			});
	}, [setLoadingInfo]);

	/**
	 * Hide zendesk when a pupil is logged in
	 */
	useEffect(() => {
		if (isPupilUser || isAdminRoute) {
			document.body.classList.add('hide-zendesk-widget');
		} else {
			document.body.classList.remove('hide-zendesk-widget');
		}
	}, [isPupilUser, isAdminRoute]);

	/**
	 * Redirect after linking an account the the hetarchief account (eg: leerid, smartschool, klascement)
	 */
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

	/**
	 * Keep track of route changes and track the 3 last visited pages for tracking events
	 * Store them in the redux store
	 */
	useEffect(() => {
		const existingHistoryLocations = props.historyLocations;
		const newHistoryLocations = uniq([...existingHistoryLocations, location.pathname]).slice(
			-3
		);
		if (!isEqual(existingHistoryLocations, newHistoryLocations)) {
			props.setHistoryLocations(newHistoryLocations);
		}
		handlePageLoaded();
	}, [location, props, handlePageLoaded]);

	/**
	 * Check if this window was opened from somewhere else and get the embed-flow query param
	 * Store the embed-flow query param in the redux store
	 */
	useEffect(() => {
		const url = new URL(window.location.href);
		const embedFlow = url.searchParams.get('embed-flow') || '';
		const isOpenedByOtherPage = !!window.opener;

		if (isOpenedByOtherPage && !!embedFlow && props.commonUser) {
			if (
				PermissionService.hasPerm(
					props.commonUser,
					PermissionName.EMBED_ITEMS_ON_OTHER_SITES
				)
			) {
				setEmbedFlow(embedFlow);
			} else {
				ToastService.info(tHtml('app___je-hebt-geen-toegang-tot-de-embed-functionaliteit'));
			}
		} else if (embedFlow) {
			console.error(
				"Embed flow query param is present, but the page wasn't opened from another page, so window.opener is undefined. Cannot start the embed flow"
			);
		}
	}, [setEmbedFlow, props.commonUser]);

	// Render
	const renderApp = () => {
		const isLoginRoute = props.location.pathname === APP_PATH.LOGIN.route;

		return (
			<div
				className={clsx('o-app', {
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

const mapStateToProps = (state: AppState) => ({
	historyLocations: selectHistoryLocations(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
	setHistoryLocations: (locations: string[]) =>
		dispatch(setHistoryLocationsAction(locations) as any),
	setEmbedFlow: (embedFlow: string) => dispatch(setEmbedFlowAction(embedFlow) as any),
});

const AppWithRouter = compose(
	connect(mapStateToProps, mapDispatchToProps),
	withRouter,
	withUser,
	withAdminCoreConfig
)(App) as FC;

let confirmUnsavedChangesCallback: ((navigateAway: boolean) => void) | null;

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

const Root: FC = () => {
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
