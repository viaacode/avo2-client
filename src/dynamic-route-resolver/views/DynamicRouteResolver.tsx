import {
	type ContentPageInfo,
	ContentPageRenderer,
	ContentPageService,
	convertDbContentPageToContentPageInfo,
	type DbContentPage,
} from '@meemoo/admin-core-ui/dist/client.mjs';
import { Flex, IconName, Spinner } from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { keys } from 'lodash-es';
import { stringifyUrl } from 'query-string';
import React, { type ComponentType, type FC, useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Navigate, useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { compose, type Dispatch } from 'redux';

import { getPublishedDate } from '../../admin/content-page/helpers/get-published-state';
import { ItemsService } from '../../admin/items/items.service';
import { withAdminCoreConfig } from '../../admin/shared/hoc/with-admin-core-config';
import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const';
import { SpecialPermissionGroups } from '../../authentication/authentication.types';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToErrorPage } from '../../authentication/helpers/redirects/redirect-to-error-page';
import { getLoginStateAction } from '../../authentication/store/actions';
import {
	selectLogin,
	selectLoginError,
	selectLoginLoading,
} from '../../authentication/store/selectors';
import { type LoginState } from '../../authentication/store/types';
import { CollectionService } from '../../collection/collection.service';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import { OrderDirection, SearchFilter } from '../../search/search.const';
import InteractiveTour from '../../shared/components/InteractiveTour/InteractiveTour';
import JsonLd from '../../shared/components/JsonLd/JsonLd';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { buildLink } from '../../shared/helpers/build-link';
import { CustomError } from '../../shared/helpers/custom-error';
import { getEnv } from '../../shared/helpers/env';
import { getFullName, stripHtml } from '../../shared/helpers/formatters';
import { isPupil } from '../../shared/helpers/is-pupil';
import { generateSearchLinkString } from '../../shared/helpers/link';
import useTranslation from '../../shared/hooks/useTranslation';
import { getPageNotFoundError } from '../../shared/translations/page-not-found';
import { Locale } from '../../shared/translations/translations.types';
import { type AppState } from '../../store';
import {
	DynamicRouteType,
	GET_ERROR_MESSAGES,
	GET_REDIRECTS,
} from '../dynamic-route-resolver.const';

interface RouteInfo {
	type: DynamicRouteType;
	data: any;
}

interface DynamicRouteResolverProps {
	getLoginState: () => Dispatch;
	loginState: Avo.Auth.LoginResponse | null;
	loginStateError: boolean;
	loginStateLoading: boolean;
}

const DynamicRouteResolver: FC<DynamicRouteResolverProps> = ({
	getLoginState,
	loginState,
	loginStateError,
	loginStateLoading,
}) => {
	const { tText, tHtml } = useTranslation();
	const navigateFunc = useNavigate();
	const location = useLocation();

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
				navigateFunc('/start', { replace: true });
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
						navigateFunc(
							buildLink(APP_PATH.ITEM_DETAIL.route, { id: itemExternalId }),
							{ replace: true }
						);
						return;
					} // else keep analysing

					// Check if id matches a bundle id
					const bundleUuid = await CollectionService.fetchUuidByAvo1Id(avo1Id);
					if (bundleUuid) {
						// Redirect to the new bundle url, since we want to discourage use of the old avo1 urls
						navigateFunc(buildLink(APP_PATH.BUNDLE_DETAIL.route, { id: bundleUuid }), {
							replace: true,
						});
						return;
					} // else keep analysing
				}
			}

			// Check if path is old item id
			if (/\/pid\/[^/]+/g.test(pathname)) {
				const itemPid = (pathname.split('/').pop() || '').trim();
				navigateFunc(buildLink(APP_PATH.ITEM_DETAIL.route, { id: itemPid }), {
					replace: true,
				});
				return;
			}

			// Special route exception
			// /klaar/archief: redirect teachers to search page with klaar filter
			const commonUserInfo = (loginState as Avo.Auth.LoginResponseLoggedIn)?.commonUserInfo;
			if (
				pathname === '/klaar/archief' &&
				commonUserInfo &&
				PermissionService.hasPerm(commonUserInfo, PermissionName.SEARCH)
			) {
				navigateFunc(
					generateSearchLinkString(
						SearchFilter.serie,
						'KLAAR',
						SearchFilter.broadcastDate,
						OrderDirection.desc
					),
					{ replace: true }
				);
				return;
			}

			// Check if path points to a content page
			try {
				const contentPage: DbContentPage | null =
					await ContentPageService.getContentPageByLanguageAndPath(
						Locale.Nl as any,
						pathname
					);
				if (contentPage) {
					// Path is indeed a content page url
					setRouteInfo({
						type: DynamicRouteType.CONTENT_PAGE,
						data: convertDbContentPageToContentPageInfo(contentPage),
					});
				}
			} catch (err) {
				console.error({
					message: 'Failed to check if path corresponds to a content page',
					innerException: err,
					additionalInfo: { pathname },
				});
				if (JSON.stringify(err).includes('CONTENT_PAGE_DEPUBLISHED')) {
					const type = (err as any)?.innerException?.additionalInfo?.responseBody
						?.additionalInfo?.contentPageType;
					setRouteInfo({
						type: DynamicRouteType.DEPUBLISHED_CONTENT_PAGE,
						data: { type },
					});
				} else if (
					commonUserInfo &&
					JSON.stringify(err).includes('CONTENT_PAGE_WRONG_USER_GROUP')
				) {
					const contentPageUserGroups = (err as any)?.innerException?.additionalInfo
						?.responseBody?.additionalInfo?.contentPageUserGroups as string[];

					if (
						contentPageUserGroups.every(
							(userGroup) =>
								isPupil(userGroup) || userGroup === SpecialUserGroupId.Admin
						)
					) {
						setRouteInfo({
							type: DynamicRouteType.PUPIL_ONLY_PAGE,
							data: null,
						});
					} else if (
						contentPageUserGroups.every((userGroup) => !isPupil(userGroup)) &&
						isPupil(commonUserInfo.userGroup?.id)
					) {
						setRouteInfo({
							type: DynamicRouteType.NOT_FOR_PUPIL_PAGE,
							data: null,
						});
					} else {
						setRouteInfo({
							type: DynamicRouteType.WRONG_USER_GROUP_PAGE,
							data: null,
						});
					}
				} else {
					setRouteInfo({ type: DynamicRouteType.NOT_FOUND, data: null });
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
		tHtml,
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
	}, [getLoginState, loginState, loginStateError, loginStateLoading, tText, tHtml, location]);

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

	// const handleLoaded = () => {
	// 	if (location.hash) {
	// 		const element = document.getElementById(location.hash.slice(1));
	// 		if (element) {
	// 			element.scrollIntoView({ behavior: 'smooth' });
	// 		}
	// 	} else {
	// 		scrollTo({ top: 0 });
	// 	}
	// };

	const renderRouteComponent = () => {
		if (routeInfo && routeInfo.type === DynamicRouteType.CONTENT_PAGE) {
			const routeUserGroupIds = ((routeInfo.data as DbContentPage).userGroupIds ?? []).map(
				(id) => String(id)
			);
			// Check if the page requires the user to be logged in and not both logged in or out
			if (
				routeUserGroupIds.includes(SpecialPermissionGroups.loggedInUsers) &&
				!routeUserGroupIds.includes(SpecialPermissionGroups.loggedOutUsers) &&
				loginState?.message !== 'LOGGED_IN'
			) {
				return <Navigate to={APP_PATH.REGISTER_OR_LOGIN.route} />;
			}

			const description =
				routeInfo.data?.seo_description ||
				routeInfo.data?.description ||
				(routeInfo.data?.description_html
					? stripHtml(routeInfo.data?.description_html)
					: null) ||
				'';
			return (
				<>
					<Helmet>
						<title>{GENERATE_SITE_TITLE(routeInfo.data?.title)}</title>
						<meta name="description" content={description} />
					</Helmet>
					<JsonLd
						url={window.location.href}
						title={routeInfo.data?.title || ''}
						description={description}
						image={routeInfo.data?.thumbnail_path}
						isOrganisation={!!routeInfo.data?.profile?.organisation}
						author={getFullName(routeInfo.data?.profile, true, false)}
						publishedAt={getPublishedDate(routeInfo.data)}
						updatedAt={routeInfo.data?.updated_at}
					/>
					{routeInfo.data && (
						<>
							<InteractiveTour showButton={false} />
							<ContentPageRenderer
								contentPageInfo={routeInfo.data as ContentPageInfo}
								commonUser={
									(loginState as Avo.Auth.LoginResponseLoggedIn).commonUserInfo
								}
								renderFakeTitle={
									(routeInfo.data as ContentPageInfo).contentType === 'FAQ_ITEM'
								}
							/>
						</>
					)}
				</>
			);
		}
		if (routeInfo && routeInfo.type === DynamicRouteType.DEPUBLISHED_CONTENT_PAGE) {
			return (
				<ErrorView
					icon={IconName.clock}
					actionButtons={['home', 'helpdesk']}
					message={
						GET_ERROR_MESSAGES()[`DEPUBLISHED_${routeInfo.data.type}`] ||
						GET_ERROR_MESSAGES()[`DEPUBLISHED_PAGINA`]
					}
				/>
			);
		}
		if (routeInfo && routeInfo.type === DynamicRouteType.PUPIL_ONLY_PAGE) {
			return (
				<ErrorView
					icon={IconName.clock}
					actionButtons={['help', 'helpdesk']}
					message={GET_ERROR_MESSAGES()[`PUPIL_ONLY`]}
				/>
			);
		}
		if (routeInfo && routeInfo.type === DynamicRouteType.NOT_FOR_PUPIL_PAGE) {
			return (
				<ErrorView
					icon={IconName.clock}
					actionButtons={['pupils']}
					message={GET_ERROR_MESSAGES()[`NOT_FOR_PUPILS`]}
				/>
			);
		}
		if (routeInfo && routeInfo.type === DynamicRouteType.WRONG_USER_GROUP_PAGE) {
			return (
				<ErrorView
					icon={IconName.clock}
					actionButtons={['help', 'helpdesk']}
					message={GET_ERROR_MESSAGES()[`OTHER_ROLES`]}
				/>
			);
		}
		console.error(
			new CustomError("Route doesn't seem to be a bundle or content page", null, {
				routeInfo,
				path: location.pathname,
			})
		);

		window.open(
			stringifyUrl({
				url: `${getEnv('PROXY_URL')}/not-found`,
				query: {
					message: getPageNotFoundError(loginState?.message === 'LOGGED_IN'),
					url: window.location.href,
				},
			}),
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
	connect(mapStateToProps, mapDispatchToProps) as any,
	withAdminCoreConfig
)(DynamicRouteResolver as ComponentType) as unknown as FC<DynamicRouteResolverProps>;
