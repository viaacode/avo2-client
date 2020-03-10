import { get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router';
import { Dispatch } from 'redux';

import { Avo } from '@viaa/avo2-types';

import { SpecialPermissionGroups } from '../../authentication/authentication.types';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionNames } from '../../authentication/helpers/permission-service';
import { getLoginStateAction } from '../../authentication/store/actions';
import {
	selectLogin,
	selectLoginError,
	selectLoginLoading,
	selectUser,
} from '../../authentication/store/selectors';
import { GET_COLLECTIONS_BY_AVO1_ID } from '../../bundle/bundle.gql';
import { APP_PATH } from '../../constants';
import { ContentPage } from '../../content-page/views';
import { ErrorView } from '../../error/views';
import { LoadingErrorLoadedComponent } from '../../shared/components';
import { LoadingInfo } from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { buildLink, CustomError, generateSearchLinkString } from '../../shared/helpers';
import { dataService } from '../../shared/services/data-service';
import { getContentPageByPath } from '../../shared/services/navigation-items-service';
import { AppState } from '../../store';

type DynamicRouteType = 'contentPage' | 'bundle' | 'notFound';

interface RouteInfo {
	type: DynamicRouteType;
	data: any;
}

interface DynamicRouteResolverProps extends DefaultSecureRouteProps {
	getLoginState: () => Dispatch;
	loginState: Avo.Auth.LoginResponse | null;
	loginStateError: boolean;
	loginStateLoading: boolean;
}

const DynamicRouteResolver: FunctionComponent<DynamicRouteResolverProps> = ({
	getLoginState,
	history,
	location,
	loginState,
	loginStateError,
	loginStateLoading,
	match,
	user,
}) => {
	const [t] = useTranslation();

	// State
	const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	const analyseRoute = useCallback(async () => {
		try {
			// Check if path points to a bundle
			if (/\/media\/[^/]+\/[^/]+/g.test(location.pathname)) {
				const avo1BundleId = (location.pathname.split('/').pop() || '').trim();
				if (avo1BundleId) {
					const response = await dataService.query({
						query: GET_COLLECTIONS_BY_AVO1_ID,
						variables: {
							avo1Id: avo1BundleId,
						},
					});
					const bundleUuid: string | undefined = get(response, 'data.items[0].id');
					if (bundleUuid) {
						// Redirect to the new bundle url, since we want to discourage use of the old avo1 urls
						history.push(buildLink(APP_PATH.BUNDLE_DETAIL.route, { id: bundleUuid }));
						return;
					} // else keep analysing
				}
			}

			// Check if path points to a content page
			const contentPage: Avo.Content.Content | null = await getContentPageByPath(
				location.pathname
			);
			if (!contentPage) {
				setRouteInfo({ type: 'notFound', data: null });
				setLoadingInfo({
					state: 'loaded',
				});
				return;
			}
			// Path is indeed a content page url
			setRouteInfo({ type: 'contentPage', data: contentPage });
			setLoadingInfo({
				state: 'loaded',
			});
			return;
		} catch (err) {
			console.error(
				new CustomError('Error during analysis of the route', err, {
					path: location.pathname,
				})
			);
			setLoadingInfo({
				state: 'error',
				message: t('error/views/error-view___de-pagina-werd-niet-gevonden'),
				icon: 'search',
			});
		}
	}, [location.pathname, history, t]);

	// Analyse the path and determine the routeType
	useEffect(() => {
		if (!location.pathname || loadingInfo.state === 'loaded') {
			return;
		}

		analyseRoute();
	}, [location.pathname, loadingInfo.state, analyseRoute]);

	// Check if current user is logged in
	useEffect(() => {
		if (!loginState && !loginStateLoading && !loginStateError) {
			getLoginState();
		}
	}, [getLoginState, loginState, loginStateError, loginStateLoading]);

	const renderRouteComponent = () => {
		if (routeInfo && routeInfo.type === 'contentPage') {
			const routeUserGroupIds = get(routeInfo, 'data.user_group_ids', []);
			// Check if the page requires the user to be logged in and not both logged in or out
			if (
				routeUserGroupIds.includes[SpecialPermissionGroups.loggedInUsers] &&
				!routeUserGroupIds.includes[SpecialPermissionGroups.loggedOutUsers]
			) {
				return (
					<Redirect
						to={{
							pathname: APP_PATH.REGISTER_OR_LOGIN.route,
							state: { from: location },
						}}
					/>
				);
			}

			// Special route exceptions
			// /klaar/archief: redirect teachers to search page with klaar filter
			const routePath = get(routeInfo, 'data.path', '');
			// TODO: Ideally this should be based on the users user-group ids
			const isTeacher = get(user, 'profile.permissions', []).includes(PermissionNames.SEARCH);
			if (routePath === '/klaar/archief' && isTeacher) {
				return <Redirect to={generateSearchLinkString('serie', 'Klaar')} />;
			}

			return (
				<ContentPage
					contentPage={routeInfo.data}
					history={history}
					location={location}
					match={match}
					user={user}
				/>
			);
		}
		console.error(
			new CustomError("Route doesn't seem to be a bundle or content page", null, {
				routeInfo,
				path: location.pathname,
			})
		);
		return (
			<ErrorView
				message={t('error/views/error-view___de-pagina-werd-niet-gevonden')}
				icon="search"
				actionButtons={['home', 'helpdesk']}
			/>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={routeInfo}
			render={renderRouteComponent}
		/>
	);
};

const mapStateToProps = (state: AppState) => ({
	loginState: selectLogin(state),
	loginStateLoading: selectLoginLoading(state),
	loginStateError: selectLoginError(state),
	user: selectUser(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
	getLoginState: () => dispatch(getLoginStateAction() as any),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DynamicRouteResolver));
