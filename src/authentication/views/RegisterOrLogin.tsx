import React, { FunctionComponent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router';

import {
	Button,
	Column,
	Container,
	Flex,
	FlexItem,
	Grid,
	Heading,
	Modal,
	ModalBody,
	Spacer,
} from '@viaa/avo2-components';

import { APP_PATH } from '../../constants';

import LoginOptions from '../components/LoginOptions';
import { redirectToClientPage } from '../helpers/redirects';
import './RegisterOrLogin.scss';

export interface RegisterOrLoginProps extends RouteComponentProps {}

const RegisterOrRegisterOrLogin: FunctionComponent<RegisterOrLoginProps> = ({
	history,
	location,
	match,
}) => {
	const [t] = useTranslation();

	return (
		<Container className="c-register-login-view" mode="horizontal">
			<Container mode="vertical">
				<Modal className="c-register-login-view__modal" isOpen size="medium">
					<ModalBody>
						<Grid>
							<Column size="3-6">
								<Flex center orientation="horizontal">
									<FlexItem>
										<h2 className="c-h2 u-m-0">
											<Trans>Welkom op Het Archief voor Onderwijs</Trans>
										</h2>
										<Spacer margin={['top-small', 'bottom']}>
											<p>
												<Trans>
													Maak een gratis account aan en verrijk je lessen met beeld en geluid op
													maat van de klas.
												</Trans>
											</p>
										</Spacer>
										<Spacer margin={['top-small', 'bottom-small']}>
											<Button
												block
												label={t('Account aanmaken als lesgever')}
												type="primary"
												onClick={() => redirectToClientPage(APP_PATH.STAMBOEK, history)}
											/>
										</Spacer>
										<Button
											block
											label={t('Krijg toegang als leerling')}
											type="primary"
											onClick={() => redirectToClientPage(APP_PATH.FOR_PUPILS, history)}
										/>
									</FlexItem>
								</Flex>
							</Column>
							<Column size="3-6">
								<Flex center orientation="horizontal">
									<FlexItem>
										<Heading type="h2" className="u-m-0">
											<Trans>Reeds een account?</Trans>
											<br />
											<Trans>Log dan hier in.</Trans>
										</Heading>
										<LoginOptions history={history} location={location} match={match} />
									</FlexItem>
								</Flex>
							</Column>
						</Grid>
					</ModalBody>
				</Modal>
			</Container>
		</Container>
	);
};

export default RegisterOrRegisterOrLogin;
