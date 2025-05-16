import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Flex, Spacer, Spinner } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type FC, useEffect, useMemo, useState } from 'react';
import { connect, Provider } from 'react-redux';
import {
	Route,
	type RouteComponentProps,
	BrowserRouter as Router,
	withRouter,
} from 'react-router-dom';
import { compose, type Dispatch } from 'redux';
import { QueryParamProvider } from 'use-query-params';

import { LoginMessage } from '../authentication/authentication.types';
import { getLoginStateAction } from '../authentication/store/actions';
import { selectCommonUser, selectLogin, selectUser } from '../authentication/store/selectors';
import { LoadingErrorLoadedComponent } from '../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { CustomError } from '../shared/helpers/custom-error';
import withUser, { type UserProps } from '../shared/hocs/withUser';
import { waitForTranslations } from '../shared/translations/i18n';
import type { AppState } from '../store';

import Embed from './components/Embed';
import RegisterOrLogin from './components/RegisterOrLogin';
import store from './store';

import '../styles/main.scss';

const EmbedApp: FC<
	RouteComponentProps &
		UserProps & {
			getLoginState: () => Dispatch;
			loginState: Avo.Auth.LoginResponse | null;
			loginStateError: boolean;
			loginStateLoading: boolean;
		}
> = ({ loginState, loginStateLoading, loginStateError, getLoginState, commonUser }) => {
	const [translationsLoaded, setTranslationsLoaded] = useState<boolean>(false);

	const loadingInfo = useMemo(() => {
		if (translationsLoaded && !loginStateLoading) {
			return { state: 'loaded' };
		}
		return { state: 'loading' };
	}, [translationsLoaded, loginStateLoading]);

	/**
	 * Wait for translations to be loaded before rendering the app
	 */
	useEffect(() => {
		waitForTranslations
			.then(() => {
				setTranslationsLoaded(true);
			})
			.catch((err) => {
				console.error(new CustomError('Failed to wait for translations', err));
			});
	}, [setTranslationsLoaded]);

	useEffect(() => {
		if (!loginState && !loginStateLoading && !loginStateError) {
			getLoginState();
		}
	}, [getLoginState, loginState, loginStateLoading, loginStateError]);

	// Render
	const renderApp = () => {
		if ((!loginState || loginStateLoading) && !loginStateError) {
			// Wait for login check
			return (
				<Spacer margin={['top-large', 'bottom-large']}>
					<Flex center>
						<Spinner size="large" />
					</Flex>
				</Spacer>
			);
		}

		if (loginState?.message !== LoginMessage.LOGGED_IN || !commonUser) {
			return <RegisterOrLogin />;
		}

		// Check if the page requires the user to be logged in and not both logged in or out
		return <Embed />;
	};

	return (
		<div className="o-app u-p-t-0">
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				dataObject={{}}
				render={renderApp}
			/>
		</div>
	);
};

const mapStateToProps = (state: AppState) => ({
	user: selectUser(state),
	commonUser: selectCommonUser(state),
	loginState: selectLogin(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		getLoginState: () => dispatch(getLoginStateAction() as any),
	};
};

const EmbedAppWithRouter = compose(
	withRouter,
	connect(mapStateToProps, mapDispatchToProps),
	withUser
)(EmbedApp) as FC;

const queryClient = new QueryClient();

const EmbedRoot: FC = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<Provider store={store}>
				<Router>
					<QueryParamProvider ReactRouterRoute={Route}>
						<EmbedAppWithRouter />
					</QueryParamProvider>
				</Router>
			</Provider>
		</QueryClientProvider>
	);
};

export default EmbedRoot;
