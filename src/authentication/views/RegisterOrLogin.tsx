import {
	Column,
	Container,
	Flex,
	FlexItem,
	Grid,
	Modal,
	ModalBody,
	Spacer,
} from '@viaa/avo2-components';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { RouteComponentProps, withRouter } from 'react-router';

import { GENERATE_SITE_TITLE } from '../../constants';
import LoginOptions from '../components/LoginOptions';

import './RegisterOrLogin.scss';

export interface RegisterOrLoginProps {}

const RegisterOrLogin: FunctionComponent<RegisterOrLoginProps & RouteComponentProps> = ({
	history,
	location,
	match,
}) => {
	const [t] = useTranslation();

	return (
		<Container className="c-register-login-view" mode="horizontal">
			<Container mode="vertical">
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							t(
								'authentication/views/register-or-login___registratie-of-login-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={t(
							'authentication/views/register-or-login___registratie-of-login-pagina-beschrijving'
						)}
					/>
				</MetaTags>

				<Modal className="c-register-login-view__modal" isOpen size="medium">
					<ModalBody>
						<Grid className="u-bg-gray-100">
							<Column size="3-6">
								<Flex className="u-maximize-height" center orientation="vertical">
									<FlexItem className="c-register-login-view__text">
										<h2 className="c-h2 u-m-0">
											{t(
												'authentication/views/register-or-login___welkom-op-het-archief-voor-onderwijs'
											)}
										</h2>

										<Spacer margin={['top-small']}>
											<p>
												{t(
													'authentication/views/register-or-login___maak-een-gratis-account-aan-en-verrijk-je-lessen-met-beeld-en-geluid-op-maat-van-de-klas'
												)}
											</p>
										</Spacer>
									</FlexItem>
								</Flex>
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
