import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { get } from 'lodash-es';

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
											<Button icon="smartschool" label="Login met Smartschool" />
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
