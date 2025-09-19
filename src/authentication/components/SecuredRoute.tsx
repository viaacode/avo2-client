import { type ComponentType, type FC } from 'react';

export interface SecuredRouteProps {
	Component: ComponentType<any>;
	exact?: boolean;
	path?: string;
}

export const SecuredRoute: FC<SecuredRouteProps> = (
	{
		// Component, path
	}
) => {
	// const { tText } = useTranslation();
	// const navigateFunc = useNavigate();

	// useEffect(() => {
	// 	if (!loginState && !loginStateLoading && !loginStateError) {
	// 		getLoginState();
	// 	}
	// }, [getLoginState, loginState, loginStateLoading, loginStateError]);
	//
	// if ((!loginState || loginStateLoading) && !loginStateError) {
	// 	// Wait for login check
	// 	return (
	// 		<Spacer margin={['top-large', 'bottom-large']}>
	// 			<Flex center>
	// 				<Spinner size="large" />
	// 			</Flex>
	// 		</Spacer>
	// 	);
	// }
	//
	// if (loginStateError) {
	// 	redirectToClientPage(
	// 		buildLink(
	// 			APP_PATH.ERROR.route,
	// 			{},
	// 			{
	// 				message: tText(
	// 					'authentication/components/secured-route___het-inloggen-is-mislukt-controleer-je-internet-verbinding-of-probeer-later-opnieuw'
	// 				),
	// 				icon: IconName.alertTriangle,
	// 				actionButtons: 'home, helpdesk',
	// 			}
	// 		),
	// 		navigateFunc
	// 	);
	// 	return null;
	// }
	//
	// const SecureRouteBody = () => {
	// 	// Already logged in
	// 	if (
	// 		loginState &&
	// 		loginState.message === LoginMessage.LOGGED_IN &&
	// 		loginState.commonUserInfo
	// 	) {
	// 		if (!loginState.acceptedConditions) {
	// 			// Redirect to the accept user and privacy declaration
	// 			return <Navigate to={APP_PATH.ACCEPT_CONDITIONS.route} />;
	// 		}
	// 		if (!isProfileComplete(loginState.commonUserInfo)) {
	// 			// Redirect to the complete profile route
	// 			// So we can redirect to the originally requested route once the user completes their profile info
	// 			return <Navigate to={APP_PATH.COMPLETE_PROFILE.route} />;
	// 		}
	// 		return <Component user={loginState.userInfo} commonUser={loginState.commonUserInfo} />;
	// 	}
	//
	// 	if (Component === QuickLaneDetail || Component === AssignmentDetailSwitcher) {
	// 		setPreferredLoginOption(LoginOptionsTabs.STUDENT);
	// 	}
	//
	// 	if (Component === QuickLaneDetail || Component === AssignmentDetailSwitcher) {
	// 		setPreferredLoginOption(LoginOptionsTabs.STUDENT);
	// 	}
	//
	// 	// On errors or not logged in => redirect to login or register page
	// 	return <Navigate to={APP_PATH.REGISTER_OR_LOGIN.route} />;
	// };

	// return <Route {...(path ? { path } : {})} element={<SecureRouteBody />} />;
	return null;
};
