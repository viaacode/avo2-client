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

import { redirectToClientPage, redirectToServerSmartschoolLogin } from '../helpers/redirects';
import './RegisterOrLogin.scss';

export interface RegisterOrLoginProps extends RouteComponentProps {}

const RegisterOrRegisterOrLogin: FunctionComponent<RegisterOrLoginProps> = ({
	history,
	location,
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
										<Button
											label="Account aanmaken"
											type="primary"
											onClick={() => redirectToClientPage(APP_PATH.FOR_TEACHERS, history)}
										/>
									</FlexItem>
								</Flex>
							</Column>
							<Column size="3-6">
								<Flex center orientation="horizontal">
									<FlexItem>
										<Spacer margin="bottom-large">
											<Heading type="h2" className="u-m-0">
												Reeds een account?
												<br />
												Log dan hier in.
											</Heading>
											<Spacer margin="top-small">
												<Button
													label="Inloggen met e-mailadres"
													type="primary"
													className="c-login-with-archief"
													onClick={() => redirectToClientPage(APP_PATH.LOGIN_AVO, history)}
												/>
											</Spacer>
										</Spacer>
										<p>Of kies voor ...</p>
										<Spacer margin={['top-small', 'bottom-small']}>
											<Button
												block
												className="c-button-smartschool"
												icon="smartschool"
												label="Inloggen met Smartschool"
												onClick={() => redirectToServerSmartschoolLogin(location)}
											/>
										</Spacer>
										<Button
											block
											className="c-button-klascement"
											icon="klascement"
											label="Inloggen met KlasCement"
										/>
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
