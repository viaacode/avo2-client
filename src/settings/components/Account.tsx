import { get } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { RouteComponentProps } from 'react-router';

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
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { Trans } from 'react-i18next';
import { hasIdpLinked } from '../../authentication/helpers/get-profile-info';
import {
	redirectToServerLinkAccount,
	redirectToServerUnlinkAccount,
} from '../../authentication/helpers/redirects';

export interface AccountProps extends RouteComponentProps {
	user: Avo.User.User;
}

const Account: FunctionComponent<AccountProps> = ({ location, user }) => {
	const getSsumAccountEditPage = () => {
		// TODO replace this with a call to a proxy server route that forwards to the ssum page
		// with the user already logged in and a redirect url back to this webpage after the user saves their changes
		return 'https://account.hetarchief.be/';
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
										<Heading type="h3">
											<Trans i18nKey="settings/components/account___account">Account</Trans>
										</Heading>
										<FormGroup label="Email">
											<span>{get(user, 'mail')}</span>
										</FormGroup>
										<Spacer margin="top-large">
											<Alert type="info">
												<span>
													<h4 className="c-h4">
														<Trans i18nKey="settings/components/account___viaa-identiteitsmanagement-systeem">
															VIAA identiteitsmanagement systeem
														</Trans>
													</h4>
													<Trans i18nKey="settings/components/account___jouw-account-wordt-beheerd-in-een-centraal-identiteitsmanagementsysteem-dat-je-toelaat-om-met-dezelfde-gegevens-op-meerdere-viaa-websites-en-applicaties-in-te-loggen">
														Jouw account wordt beheerd in een centraal identiteitsmanagementsysteem
														dat je toelaat om met dezelfde gegevens op meerdere VIAA-websites en
														applicaties in te loggen.{' '}
													</Trans>
													<br />
													<Trans i18nKey="settings/components/account___wijzigingen-aan-deze-gegevens-worden-dus-doorgevoerd-in-al-deze-websites-en-tools">
														Wijzigingen aan deze gegevens worden dus doorgevoerd in al deze websites
														en tools.
													</Trans>
													<br />
													<a href={getSsumAccountEditPage()}>
														<Trans i18nKey="settings/components/account___beheer-je-account-gegevens">
															Beheer je account gegevens
														</Trans>
													</a>
												</span>
											</Alert>
										</Spacer>
									</Form>

									<div className="c-hr" />

									<FormGroup label="Koppel je account met andere platformen">
										{hasIdpLinked(user, 'SMARTSCHOOL') ? (
											<>
												<span>
													<Trans i18nKey="settings/components/account___uw-smartschool-account-is-reeds-gelinkt">
														Uw smartschool account is reeds gelinkt
													</Trans>
												</span>
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
export default Account;
