import {
	type ContentPageInfo,
	ContentPageRenderer,
	ContentPageService,
	type DbContentPage,
	LanguageCode,
} from '@meemoo/admin-core-ui';
import { Flex, IconName, Spinner } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { PermissionName } from '@viaa/avo2-types';
import { get, keys } from 'lodash-es';
import React, {
	type ComponentType,
	type FunctionComponent,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Redirect, type RouteComponentProps, withRouter } from 'react-router';
import { compose, type Dispatch } from 'redux';

import { getPublishedDate } from '../../admin/content-page/helpers/get-published-state';
import { ItemsService } from '../../admin/items/items.service';
import { withAdminCoreConfig } from '../../admin/shared/hoc/with-admin-core-config';
import { SpecialPermissionGroups } from '../../authentication/authentication.types';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToErrorPage } from '../../authentication/helpers/redirects';
import { getLoginStateAction } from '../../authentication/store/actions';
import {
	selectLogin,
	selectLoginError,
	selectLoginLoading,
} from '../../authentication/store/selectors';
import type { LoginState } from '../../authentication/store/types';
import { CollectionService } from '../../collection/collection.service';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import { OrderDirection, SearchFilter } from '../../search/search.const';
import { LoadingErrorLoadedComponent, type LoadingInfo } from '../../shared/components';
import JsonLd from '../../shared/components/JsonLd/JsonLd';
import {
	buildLink,
	CustomError,
	generateSearchLinkString,
	getEnv,
	getFullName,
	stripHtml,
} from '../../shared/helpers';
import useTranslation from '../../shared/hooks/useTranslation';
import { getPageNotFoundError } from '../../shared/translations/page-not-found';
import { type AppState } from '../../store';
import { GET_ERROR_MESSAGES, GET_REDIRECTS } from '../dynamic-route-resolver.const';

type DynamicRouteType = 'contentPage' | 'bundle' | 'notFound' | 'depublishedContentPage';

interface RouteInfo {
	type: DynamicRouteType;
	data: any;
}

interface DynamicRouteResolverProps extends RouteComponentProps {
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
}) => {
	const { tText, tHtml } = useTranslation();

	// State
	const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	const analyseRoute = useCallback(async () => {
		try {
			if (!loginState) {
				setLoadingInfo({
					state: 'error',
					message: tHtml(
						'dynamic-route-resolver/views/dynamic-route-resolver___het-controleren-van-je-login-status-is-mislukt'
					),
					actionButtons: ['home', 'helpdesk'],
				});
				return;
			}

			const pathname = location.pathname;

			// Check if path is avo1 path that needs to be redirected
			const redirects = GET_REDIRECTS();
			const pathWithHash = pathname + location.hash;
			const key: string | undefined = keys(redirects).find((key) =>
				new RegExp(`^${key}$`, 'gi').test(pathWithHash)
			);
			if (key && redirects[key]) {
				window.location.href = redirects[key];
				return;
			}

			if (pathname === '/' && loginState.message === 'LOGGED_IN') {
				// Redirect the logged out homepage to the logged in homepage is the user is logged in
				history.replace('/start');
				return;
			}

			// Check if path is an old media url
			if (/\/media\/[^/]+\/[^/]+/g.test(pathname)) {
				const avo1Id = (pathname.split('/').pop() || '').trim();
				if (avo1Id) {
					// Check if id matches an item mediamosa id
					const itemExternalId =
						await ItemsService.fetchItemExternalIdByMediamosaId(avo1Id);

					if (itemExternalId) {
						// Redirect to the new bundle url, since we want to discourage use of the old avo1 urls
						history.replace(
							buildLink(APP_PATH.ITEM_DETAIL.route, { id: itemExternalId })
						);
						return;
					} // else keep analysing

					// Check if id matches a bundle id
					const bundleUuid = await CollectionService.fetchUuidByAvo1Id(avo1Id);
					if (bundleUuid) {
						// Redirect to the new bundle url, since we want to discourage use of the old avo1 urls
						history.replace(
							buildLink(APP_PATH.BUNDLE_DETAIL.route, { id: bundleUuid })
						);
						return;
					} // else keep analysing
				}
			}

			// Check if path is old item id
			if (/\/pid\/[^/]+/g.test(pathname)) {
				const itemPid = (pathname.split('/').pop() || '').trim();
				history.replace(buildLink(APP_PATH.ITEM_DETAIL.route, { id: itemPid }));
				return;
			}

			// Special route exception
			// /klaar/archief: redirect teachers to search page with klaar filter
			const userInfo = (loginState as Avo.Auth.LoginResponseLoggedIn)?.userInfo;
			if (
				pathname === '/klaar/archief' &&
				userInfo &&
				PermissionService.hasPerm(userInfo, PermissionName.SEARCH)
			) {
				history.replace(
					generateSearchLinkString(
						SearchFilter.serie,
						'KLAAR',
						SearchFilter.broadcastDate,
						OrderDirection.desc
					)
				);
				return;
			}

			// Check if path points to a content page
			try {
				const contentPage: ContentPageInfo | null =
					await ContentPageService.getContentPageByLanguageAndPath(
						LanguageCode.Nl,
						pathname
					);
				// Path is indeed a content page url
				setRouteInfo({ type: 'contentPage', data: contentPage });
			} catch (err) {
				console.error({
					message: 'Failed to check if path corresponds to a content page',
					innerException: err,
					additionalInfo: { pathname },
				});
				if (JSON.stringify(err).includes('CONTENT_PAGE_DEPUBLISHED')) {
					const type = get(
						err,
						'innerException.additionalInfo.responseContent.additionalInfo.contentPageType'
					);
					setRouteInfo({ type: 'depublishedContentPage', data: { type } });
				} else {
					setRouteInfo({ type: 'notFound', data: null });
				}
			}

			return;
		} catch (err) {
			console.error(
				new CustomError('Error during analysis of the route', err, {
					path: location.pathname,
				})
			);
			setLoadingInfo({
				state: 'error',
				message: getPageNotFoundError(loginState?.message === 'LOGGED_IN'),
				icon: IconName.search,
			});
		}
	}, [
		loginState,
		location.pathname,
		location.hash,
		setRouteInfo,
		setLoadingInfo,
		history,
		tText,
	]);

	// Check if current user is logged in
	useEffect(() => {
		if (!loginState && !loginStateLoading && !loginStateError) {
			getLoginState();
		} else if (loginStateError) {
			console.error(
				new CustomError('Login error was encountered', null, {
					loginStateError,
					loginState,
				})
			);
			redirectToErrorPage(
				{
					message: tHtml(
						'dynamic-route-resolver/views/dynamic-route-resolver___er-ging-iets-mis-bij-het-inloggen'
					),
					actionButtons: ['home', 'helpdesk'],
				},
				location
			);
		}
	}, [getLoginState, loginState, loginStateError, loginStateLoading, tText, location]);

	useEffect(() => {
		if (loginState && location.pathname) {
			// Analyse the path and determine the routeType
			analyseRoute();
		}
	}, [loginState, location.pathname, analyseRoute]);

	useEffect(() => {
		if (routeInfo) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [routeInfo]);

	const renderRouteComponent = () => {
		if (routeInfo && routeInfo.type === 'contentPage') {
			const routeUserGroupIds = ((routeInfo.data as DbContentPage).userGroupIds ?? []).map(
				(id) => String(id)
			);
			// Check if the page requires the user to be logged in and not both logged in or out
			if (
				routeUserGroupIds.includes(SpecialPermissionGroups.loggedInUsers) &&
				!routeUserGroupIds.includes(SpecialPermissionGroups.loggedOutUsers) &&
				loginState?.message !== 'LOGGED_IN'
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

			const description =
				get(routeInfo.data, 'seo_description') ||
				get(routeInfo.data, 'description') ||
				(get(routeInfo.data, 'description_html')
					? stripHtml(get(routeInfo.data, 'description_html'))
					: null) ||
				'';
			return (
				<>
					<Helmet>
						<title>{GENERATE_SITE_TITLE(get(routeInfo.data, 'title'))}</title>
						<meta name="description" content={description} />
					</Helmet>
					<JsonLd
						url={window.location.href}
						title={get(routeInfo.data, 'title', '')}
						description={description}
						image={get(routeInfo.data, 'thumbnail_path')}
						isOrganisation={!!get(routeInfo.data, 'profile.organisation')}
						author={getFullName(get(routeInfo.data, 'profile'), true, false)}
						publishedAt={getPublishedDate(routeInfo.data)}
						updatedAt={get(routeInfo.data, 'updated_at')}
					/>
					{routeInfo.data && (
						<ContentPageRenderer
							contentPageInfo={routeInfo.data as ContentPageInfo}
							onLoaded={() => scrollTo({ top: 0 })}
							commonUser={
								(loginState as Avo.Auth.LoginResponseLoggedIn).commonUserInfo
							}
						/>
					)}
				</>
			);
		}
		if (routeInfo && routeInfo.type === 'depublishedContentPage') {
			return (
				<ErrorView icon={IconName.clock} actionButtons={['home', 'helpdesk']} message="">
					{GET_ERROR_MESSAGES()[`DEPUBLISHED_${routeInfo.data.type}`] ||
						GET_ERROR_MESSAGES()[`DEPUBLISHED_PAGINA`]}
				</ErrorView>
			);
		}
		console.error(
			new CustomError("Route doesn't seem to be a bundle or content page", null, {
				routeInfo,
				path: location.pathname,
			})
		);

		window.open(
			`${getEnv('PROXY_URL')}/not-found?message=${getPageNotFoundError(
				loginState?.message === 'LOGGED_IN'
			)}`,
			'_self'
		);
		return (
			<Flex orientation="horizontal" center>
				<Spinner size="large" />
			</Flex>
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

const mapStateToProps = (
	state: AppState
): {
	loginState: Avo.Auth.LoginResponse | null;
	loginStateLoading: boolean;
	loginStateError: boolean;
} => ({
	loginState: selectLogin(state),
	loginStateLoading: selectLoginLoading(state),
	loginStateError: selectLoginError(state),
});

const mapDispatchToProps = (dispatch: Dispatch): { getLoginState: () => LoginState } => ({
	getLoginState: () => dispatch(getLoginStateAction() as any),
});

export default compose(
	withRouter,
	connect(mapStateToProps, mapDispatchToProps) as any,
	withAdminCoreConfig
)(DynamicRouteResolver as ComponentType) as unknown as FunctionComponent<DynamicRouteResolverProps>;
