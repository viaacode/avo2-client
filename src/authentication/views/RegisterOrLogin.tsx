import { Column, Container, Grid, Modal, ModalBody } from '@viaa/avo2-components';
import React, { type FunctionComponent } from 'react';
import { Helmet } from 'react-helmet';
import { type RouteComponentProps, withRouter } from 'react-router';

import { GENERATE_SITE_TITLE } from '../../constants';
import useTranslation from '../../shared/hooks/useTranslation';
import LoginOptions from '../components/LoginOptions';

import './RegisterOrLogin.scss';

const RegisterOrLogin: FunctionComponent<RouteComponentProps> = ({ history, location, match }) => {
	const { tText, tHtml } = useTranslation();

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

				<Modal className="c-register-login-view__modal" isOpen size="medium">
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
								<LoginOptions history={history} location={location} match={match} />
							</Column>
						</Grid>
					</ModalBody>
				</Modal>
			</Container>
		</Container>
	);
};

export default withRouter(RegisterOrLogin);
