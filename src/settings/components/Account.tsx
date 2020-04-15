import { get } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router';

import {
	Alert,
	BlockHeading,
	Button,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	IconName,
	Spacer,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { hasIdpLinked } from '../../authentication/helpers/get-profile-info';
import {
	redirectToServerLinkAccount,
	redirectToServerUnlinkAccount,
} from '../../authentication/helpers/redirects';

export interface AccountProps extends RouteComponentProps {
	user: Avo.User.User;
}

const Account: FunctionComponent<AccountProps> = ({ location, user }) => {
	const [t] = useTranslation();

	const getSsumAccountEditPage = () => {
		// TODO replace this with a call to a proxy server route that forwards to the ssum page
		// with the user already logged in and a redirect url back to this webpage after the user saves their changes
		return 'https://account.hetarchief.be/';
	};

	const renderIdpLinkControls = (idpType: Avo.Auth.IdpType) => {
		if (hasIdpLinked(user, idpType)) {
			return (
				<>
					<span>
						{idpType === 'SMARTSCHOOL'
							? t(
									'settings/components/account___uw-smartschool-account-is-reeds-gelinkt'
							  )
							: t(
									'settings/components/account___je-klascement-account-is-reeds-gelinkt'
							  )}
					</span>
					<Button
						type="link"
						label={t('settings/components/account___unlink')}
						title={t(
							'settings/components/account___koppel-je-smartschool-account-los-van-je-archief-account'
						)}
						onClick={() => redirectToServerUnlinkAccount(location, idpType)}
					/>
				</>
			);
		}
		return (
			<Button
				className={`c-button-${idpType.toLocaleLowerCase()}`}
				icon={idpType.toLocaleLowerCase() as IconName}
				label={
					idpType === 'SMARTSCHOOL'
						? t('settings/components/account___link-je-smartschool-account')
						: t('settings/components/account___link-je-klascement-account')
				}
				title={
					idpType === 'SMARTSCHOOL'
						? t(
								'settings/components/account___koppel-je-smartschool-account-aan-je-archief-account'
						  )
						: t(
								'settings/components/account___koppel-je-klascement-account-aan-je-archief-account'
						  )
				}
				onClick={() => redirectToServerLinkAccount(location, idpType)}
			/>
		);
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
										<BlockHeading type="h3">
											<Trans i18nKey="settings/components/account___account">
												Account
											</Trans>
										</BlockHeading>
										<FormGroup label={t('settings/components/account___email')}>
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
													<Trans i18nKey="settings/components/account___beheerd-in-een-centraal-identiteitsmanagementsysteem">
														Jouw account wordt beheerd in een centraal
														identiteitsmanagementsysteem dat je toelaat
														om met dezelfde gegevens op meerdere
														VIAA-websites en applicaties in te loggen.{' '}
														<br /> Wijzigingen aan deze gegevens worden
														dus doorgevoerd in al deze websites en
														tools.
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

									<FormGroup
										label={t(
											'settings/components/account___koppel-je-account-met-andere-platformen'
										)}
									>
										<div>{renderIdpLinkControls('SMARTSCHOOL')}</div>
										<div>{renderIdpLinkControls('KLASCEMENT')}</div>
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
