import { Column, Container, Grid, Modal, ModalBody } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import React, { type ComponentType, type FC, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { type RouteComponentProps } from 'react-router';
import { type Dispatch } from 'redux';

import { GENERATE_SITE_TITLE } from '../../constants';
import useTranslation from '../../shared/hooks/useTranslation';
import type { AppState } from '../../store';
import LoginOptions from '../components/LoginOptions';
import { getBaseUrl, getRedirectAfterLogin } from '../helpers/redirects';
import { getLoginStateAction } from '../store/actions';
import {
	selectCommonUser,
	selectLogin,
	selectLoginError,
	selectLoginLoading,
	selectUser,
} from '../store/selectors';

import './RegisterOrLogin.scss';

const RegisterOrLogin: FC<
	RouteComponentProps & { getLoginState: () => void; loginState: Avo.Auth.LoginResponse }
> = ({ history, location, getLoginState, loginState }) => {
	const { tText, tHtml } = useTranslation();

	useEffect(() => {
		// Poll for login state
		const timerId = window.setInterval(() => {
			getLoginState();
		}, 2000);

		// Cleanup function
		return () => {
			if (timerId) {
				window.clearInterval(timerId);
			}
		};
	}, [getLoginState]);

	useEffect(() => {
		if (loginState?.message === 'LOGGED_IN') {
			// User was logged in in a different browser window/tab
			// Continue to the desired page
			const redirectToUrl = getRedirectAfterLogin(location);

			history.push(redirectToUrl.replace(getBaseUrl(location), ''));
		}
	}, [history, location, loginState]);

	return (
		<Container className="c-register-login-view" mode="horizontal">
			<Container mode="vertical">
				<Helmet>
					<title>
						{GENERATE_SITE_TITLE(
							tText(
								'authentication/views/register-or-login___registratie-of-login-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'authentication/views/register-or-login___registratie-of-login-pagina-beschrijving'
						)}
					/>
				</Helmet>

				<Modal className="c-register-login-view__modal" isOpen={true} size="medium">
					<ModalBody>
						<Grid className="u-bg-gray-100">
							<Column size="3-6">
								<h2 className="c-h2 u-m-0">
									{tHtml(
										'authentication/views/register-or-login___welkom-op-het-archief-voor-onderwijs'
									)}
								</h2>

								<p>
									{tHtml(
										'authentication/views/register-or-login___maak-een-gratis-account-aan-en-verrijk-je-lessen-met-beeld-en-geluid-op-maat-van-de-klas'
									)}
								</p>
							</Column>
							<Column size="3-6" className="u-bg-white">
								<LoginOptions />
							</Column>
						</Grid>
					</ModalBody>
				</Modal>
			</Container>
		</Container>
	);
};

const mapStateToProps = (state: AppState) => ({
	user: selectUser(state),
	commonUser: selectCommonUser(state),
	loginState: selectLogin(state),
	loginStateLoading: selectLoginLoading(state),
	loginStateError: selectLoginError(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		getLoginState: () => dispatch(getLoginStateAction() as any),
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(RegisterOrLogin as ComponentType<any>) as FC<RouteComponentProps>;
