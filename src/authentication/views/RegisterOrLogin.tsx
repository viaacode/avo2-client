import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import {
	Button,
	Column,
	Container,
	Flex,
	FlexItem,
	Grid,
	Modal,
	ModalBody,
	Spacer,
} from '@viaa/avo2-components';

import {
	redirectToClientLogin,
	redirectToClientRegister,
	redirectToServerSmartschoolLogin,
} from '../helpers/redirects';
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
											onClick={() => redirectToClientRegister(history, location)}
										/>
									</FlexItem>
								</Flex>
							</Column>
							<Column size="3-6">
								<Flex center orientation="horizontal">
									<FlexItem>
										<Spacer margin="bottom-large">
											<h2 className="c-h2 u-m-0">
												Reeds een account?
												<br />
												Log dan hier in.
											</h2>
											<Spacer margin="top-small">
												<Button
													label="Inloggen met e-mailadres"
													type="primary"
													onClick={() => redirectToClientLogin(history, location)}
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

export default withRouter(RegisterOrRegisterOrLogin);
