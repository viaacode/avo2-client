import React, { FunctionComponent, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import {
	Alert,
	Button,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	Heading,
	Spacer,
	TextInput,
} from '@viaa/avo2-components';
import {
	getProfileStamboekNumber,
	hasIdpLinked,
} from '../../authentication/helpers/get-profile-info';
import {
	redirectToServerLinkAccount,
	redirectToServerUnlinkAccount,
} from '../../authentication/helpers/redirects';
import toastService from '../../shared/services/toast-service';
import { connect } from 'react-redux';
import {
	selectLogin,
	selectLoginError,
	selectLoginLoading,
} from '../../authentication/store/selectors';
import { Avo } from '@viaa/avo2-types';

export interface AccountProps extends RouteComponentProps {
	loginState: Avo.Auth.LoginResponse | null;
}

const Account: FunctionComponent<AccountProps> = ({ location, loginState }) => {
	const [stamboekNumber, setStamboekNumber] = useState<string>(getProfileStamboekNumber() || '');

	const getSsumAccountEditPage = () => {
		// TODO replace this with a call to a proxy server route that forwards to the ssum page
		// with the user already logged in and a redirect url back to this webpage after the user saves their changes
		return 'https://account.hetarchief.be/';
	};

	const saveStamboekNumber = () => {
		toastService.info(`Nog niet geimplementeerd: ${stamboekNumber}`);
	};

	return (
		<>
			<Container mode="vertical">
				<Container mode="horizontal">
					<Spacer margin="bottom">
						<Grid>
							<Column size="3-7">
								<Form type="standard">
									<Form type="standard">
										<Heading type="h3">Account</Heading>
										<FormGroup label="Email">
											<span>test@testers.be</span>
										</FormGroup>
										{/*<FormGroup label="Wachtwoord">*/}
										{/*	<span>123456</span>*/}
										{/*</FormGroup>*/}
										{/*<FormGroup label="Geldigheid">*/}
										{/*	<span>Jouw account is nog 233 dagen geldig.</span>*/}
										{/*</FormGroup>*/}
										<Spacer margin="top-large">
											<Alert type="info">
												<span>
													<h4 className="c-h4">VIAA identiteitsmanagement systeem</h4>
													Jouw account wordt beheerd in een centraal identiteitsmanagementsysteem
													dat je toelaat om met dezelfde gegevens op meerdere VIAA-websites en
													applicaties in te loggen. <br />
													Wijzigingen aan deze gegevens worden dus doorgevoerd in al deze websites
													en tools.
													<br />
													<a href={getSsumAccountEditPage()}>Beheer je account gegevens</a>
												</span>
											</Alert>
										</Spacer>
									</Form>

									<div className="c-hr" />

									<FormGroup label="Stamboeknummer / Lerarenkaart nummer" labelFor="stamboekNumber">
										<TextInput
											placeholder="00000000000-000000"
											value={stamboekNumber}
											onChange={setStamboekNumber}
										/>
									</FormGroup>
									<Button
										label="Stamboek nummer opslaan"
										type="primary"
										onClick={saveStamboekNumber}
									/>

									<div className="c-hr" />

									<FormGroup label="Koppel je account met andere platformen">
										{hasIdpLinked(loginState, 'SMARTSCHOOL') ? (
											<>
												<span>Uw smartschool account is reeds gelinked</span>
												<Button
													type="link"
													label="unlink"
													onClick={() => redirectToServerUnlinkAccount(location, 'SMARTSCHOOL')}
												/>
											</>
										) : (
											<Button
												className="c-button-smartschool"
												icon="smartschool"
												label="Link je smartschool account"
												onClick={() => redirectToServerLinkAccount(location, 'SMARTSCHOOL')}
											/>
										)}
									</FormGroup>
								</Form>
							</Column>
							<Column size="3-5">
								<></>
							</Column>
						</Grid>
					</Spacer>
				</Container>
			</Container>
		</>
	);
};

const mapStateToProps = (state: any) => ({
	loginState: selectLogin(state),
});

export default withRouter(connect(mapStateToProps)(Account));
