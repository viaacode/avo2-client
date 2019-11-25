import { get } from 'lodash-es';
import queryString from 'query-string';
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

import { SEARCH_PATH } from '../../search/search.const';
import { getEnv } from '../../shared/helpers';

import { AUTH_PATH } from '../authentication.const';

import './RegisterOrLogin.scss';

export interface RegisterOrLoginProps extends RouteComponentProps {}

const RegisterOrRegisterOrLogin: FunctionComponent<RegisterOrLoginProps> = ({
	history,
	location,
}) => {
	const redirectToLogin = () => {
		history.push(AUTH_PATH.LOGIN_AVO, {
			from: { pathname: get(location, 'state.from.pathname', SEARCH_PATH.SEARCH) },
		});
	};

	const redirectToSmartschoolLogin = () => {
		// Redirect to smartschool login form
		const base = window.location.href.split(AUTH_PATH.REGISTER_OR_LOGIN)[0];
		// Url to return to after authentication is completed and server stored auth object in session
		const returnToUrl = base + get(location, 'state.from.pathname', SEARCH_PATH.SEARCH);
		window.location.href = `${getEnv('PROXY_URL')}/auth/smartschool/login?${queryString.stringify({
			returnToUrl,
		})}`;
	};

	// TODO: disabled feature
	// const redirectToRegister = () => {
	// 	history.push(AUTH_PATH.REGISTER, {
	// 		from: { pathname: get(location, 'state.from.pathname', SEARCH_PATH.SEARCH) },
	// 	});
	// };

	return (
		<Container className="c-register-login-view" mode="horizontal">
			<Container mode="vertical">
				<Modal className="c-register-login-view__modal" isOpen size="small">
					<ModalBody>
						<Grid>
							{/*<Column size="3-6">*/}
							{/*	<Flex center orientation="horizontal">*/}
							{/*		<FlexItem>*/}
							{/*			<h2 className="c-h2 u-m-0">Welkom op Het Archief voor Onderwijs</h2>*/}
							{/*			<Spacer margin={['top-small', 'bottom']}>*/}
							{/*				<p>*/}
							{/*					Maak een gratis account aan en verrijk je lessen met beeld en geluid op maat*/}
							{/*					van de klas.*/}
							{/*				</p>*/}
							{/*			</Spacer>*/}
							{/*			<Button label="Account aanmaken" type="primary" onClick={redirectToRegister} />*/}
							{/*		</FlexItem>*/}
							{/*	</Flex>*/}
							{/*</Column>*/}
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
													onClick={redirectToLogin}
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
												onClick={redirectToSmartschoolLogin}
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
