import React, { FunctionComponent } from 'react';
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
	return (
		<Container className="c-register-login-view" mode="horizontal">
			<Container mode="vertical">
				<Modal className="c-register-login-view__modal" isOpen size="medium">
					<ModalBody>
						<Grid>
							<Column size="3-6">
								<Flex center orientation="horizontal">
									<FlexItem>
										<h2 className="c-h2 u-m-0">Welkom op Het Archief voor Onderwijs</h2>
										<Spacer margin={['top-small', 'bottom']}>
											<p>
												Maak een gratis account aan en verrijk je lessen met beeld en geluid op maat
												van de klas.
											</p>
										</Spacer>
										<Spacer margin={['top-small', 'bottom-small']}>
											<Button
												block
												label="Account aanmaken als lesgever"
												type="primary"
												onClick={() => redirectToClientPage(APP_PATH.STAMBOEK, history)}
											/>
										</Spacer>
										<Button
											block
											label="Krijg toegang als leerling"
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
											Reeds een account?
											<br />
											Log dan hier in.
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
