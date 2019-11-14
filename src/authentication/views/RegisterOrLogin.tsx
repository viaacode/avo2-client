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
	FormGroup,
	Grid,
	Modal,
	ModalBody,
	Spacer,
} from '@viaa/avo2-components';

import { RouteParts } from '../../constants';
import { getEnv } from '../../shared/helpers';

import './RegisterOrLogin.scss';

export interface RegisterOrLoginProps extends RouteComponentProps {}

const RegisterOrRegisterOrLogin: FunctionComponent<RegisterOrLoginProps> = ({
	history,
	location,
}) => {
	const redirectToLogin = () => {
		history.push(`/${RouteParts.LoginAvo}`, {
			from: { pathname: get(location, 'state.from.pathname', `/${RouteParts.Search}`) },
		});
	};

	const redirectToSmartschoolLogin = () => {
		// Redirect to smartschool login form
		const base = window.location.href.split(`/${RouteParts.RegisterOrLogin}`)[0];
		// Url to return to after authentication is completed and server stored auth object in session
		const returnToUrl = base + get(location, 'state.from.pathname', `/${RouteParts.Search}`);
		window.location.href = `${getEnv('PROXY_URL')}/auth/smartschool/login?${queryString.stringify({
			returnToUrl,
		})}`;
	};

	const redirectToRegister = () => {
		history.push(`/${RouteParts.Register}`, {
			from: { pathname: get(location, 'state.from.pathname', `/${RouteParts.Search}`) },
		});
	};

	const redirectToHome = () => {
		history.push(`/`);
	};

	return (
		<Container mode="horizontal">
			<Container mode="vertical">
				<Modal isOpen size="medium" onClose={redirectToHome}>
					<ModalBody>
						<Grid>
							<Column size="3-6">
								<Flex center orientation="horizontal">
									<FlexItem>
										<h2 className="c-h2 u-m-0">Welkom op het Archief voor Onderwijs</h2>
										<p>Een schat aan audio en video in de klas</p>
										<p>
											Benieuwd naar meer? Neem je lerarenkaart of stamboeknummer bij de hand en
											registreer nu gratis.
										</p>
										<Button label="Registeer" type="primary" onClick={redirectToRegister} />
									</FlexItem>
								</Flex>
							</Column>
							<Column size="3-6">
								<Flex center orientation="horizontal">
									<FlexItem>
										<Spacer margin="bottom-large">
											<h2 className="c-h2 u-m-0">Reeds een account? Meld je dan hier aan.</h2>
											<FormGroup>
												<Button
													label="Login met AvO account"
													type="primary"
													onClick={redirectToLogin}
												/>
											</FormGroup>
										</Spacer>
										<p>Of meld aan met ...</p>
										<Spacer margin="bottom-small">
											<Button
												icon="smartschool"
												label="Login met Smartschool"
												className="c-smartschool-button"
												onClick={redirectToSmartschoolLogin}
											/>
										</Spacer>
										<FormGroup>
											<Button icon="klascement" label="Login met Klascement" />
										</FormGroup>
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
